use crate::types::{Metrics, Tick, WsMessage};
use futures_util::StreamExt;
use std::sync::atomic::{AtomicBool, AtomicU32, Ordering};
use std::sync::Arc;
use std::time::Duration;
use tauri::{AppHandle, Emitter};
use tokio::sync::Mutex;
use tokio::time;
use tokio_tungstenite::connect_async;

pub fn start_websocket_client(app: AppHandle, is_paused: Arc<AtomicBool>) {
    let shared_state: Arc<Mutex<Vec<Tick>>> = Arc::new(Mutex::new(Vec::new()));

    let state_for_ws = Arc::clone(&shared_state);
    let state_for_emitter = Arc::clone(&shared_state);

    // We need a clone of the AppHandle so Thread A can emit critical alerts directly
    let app_for_ws = app.clone();

    let msg_counter = Arc::new(AtomicU32::new(0));
    let latest_throughput = Arc::new(AtomicU32::new(0));

    let counter_for_ws = Arc::clone(&msg_counter);
    let counter_for_calc = Arc::clone(&msg_counter);
    let throughput_for_calc = Arc::clone(&latest_throughput);
    let throughput_for_emitter = Arc::clone(&latest_throughput);

    // THREAD A: The Native WebSocket Listener (The Firehose)
    tauri::async_runtime::spawn(async move {
        let ws_url = "ws://127.0.0.1:8080/ws";
        println!("Connecting to external backend at {}...", ws_url);
        
        match connect_async(ws_url).await {
            Ok((ws_stream, _)) => {
                println!("Connected to external backend!");
                let (_, mut read) = ws_stream.split();

                while let Some(msg) = read.next().await {
                    if let Ok(tokio_tungstenite::tungstenite::Message::Text(text)) = msg {
                        // Parse into our WsMessage Enum
                        if let Ok(parsed_msg) = serde_json::from_str::<WsMessage>(&text) {

                            counter_for_ws.fetch_add(1, Ordering::Relaxed);

                            match parsed_msg {
                                WsMessage::Batch(batch) => {
                                    // Prices update constantly, so we lock them in state for throttling
                                    let mut state = state_for_ws.lock().await;
                                    *state = batch; 
                                }
                                WsMessage::Risk(alert) => {
                                    println!("🚨 NATIVE RISK ALERT CAUGHT: {}", alert.message);
                                    app_for_ws.emit("RISK_UPDATE", alert).unwrap();
                                }
                            }
                        }
                    }
                }
            }
            Err(e) => println!("Failed to connect to backend: {}", e),
        }
    });

    // THREAD B: The UI Emitter (The 30 FPS Throttle)
        tauri::async_runtime::spawn(async move {
            let mut ticker = time::interval(Duration::from_millis(33));
            let mut emit_counter = 0; // Keeps track of how many frames we've sent

            loop {
                ticker.tick().await;
                // Check if React asked us to pause
                let currently_paused = is_paused.load(Ordering::Relaxed);

                if !currently_paused {
                    let state = state_for_emitter.lock().await;
                    if !state.is_empty() {
                        app.emit("BATCH_UPDATE", state.clone()).unwrap();

                        // --- NEW: Print a sample to the terminal once a second ---
                        emit_counter += 1;
                        if emit_counter % 30 == 0 {
                            let sample = &state[0];
                            println!(
                                "📺 IPC BRIDGE: Emitted {} items. Sample -> {}: {:.2}", 
                                state.len(), 
                                sample.isin, 
                                sample.xetra_mid
                            );
                        }
                    }
                }

                // Always emit metrics so the UI knows the system is still alive!
                // Grab the real throughput calculated by Thread C
                app.emit("METRICS_UPDATE", Metrics {
                    throughput: throughput_for_emitter.load(Ordering::Relaxed), 
                    is_paused: currently_paused,
                }).unwrap();
            }
        });

        // THREAD C: The Throughput Calculator (Runs exactly once per second)
        tauri::async_runtime::spawn(async move {
            let mut interval = time::interval(Duration::from_secs(1));
            loop {
                interval.tick().await;
                // Swap the current count to 0, and store the old count in throughput
                let current_count = counter_for_calc.swap(0, Ordering::Relaxed);
                throughput_for_calc.store(current_count, Ordering::Relaxed);

                println!("🚀 NATIVE THROUGHPUT: {} msgs/sec", current_count);
            }
        });
}