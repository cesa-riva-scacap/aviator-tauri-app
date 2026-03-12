use crate::types::{Metrics, RiskAlert, Tick};
use rand::RngExt;
use std::sync::atomic::{AtomicBool, AtomicU32, Ordering};
use std::sync::Arc;
use std::time::Duration;
use tauri::{AppHandle, Emitter};
use tokio::sync::Mutex;
use tokio::time;

pub fn start_local_mock_client(app: AppHandle, is_paused: Arc<AtomicBool>) {
    let shared_state: Arc<Mutex<Vec<Tick>>> = Arc::new(Mutex::new(Vec::new()));

    let state_for_ws = Arc::clone(&shared_state);
    let state_for_emitter = Arc::clone(&shared_state);

    let app_for_ws = app.clone();

    let msg_counter = Arc::new(AtomicU32::new(0));
    let latest_throughput = Arc::new(AtomicU32::new(0));

    let counter_for_ws = Arc::clone(&msg_counter);
    let counter_for_calc = Arc::clone(&msg_counter);
    let throughput_for_calc = Arc::clone(&latest_throughput);
    let throughput_for_emitter = Arc::clone(&latest_throughput);

    // THREAD A: The Internal Data Generator
    tauri::async_runtime::spawn(async move {
        let mut symbols = Vec::with_capacity(3000);
        for i in 0..3000 {
            symbols.push(format!("GB00BLD4Z{:04}", i));
        }

        let mut ticker = time::interval(Duration::from_millis(25)); 
        let mut risk_ticker = time::interval(Duration::from_secs(5)); 

        println!("Starting internal 3,000-row mock data generator...");

        loop {
            tokio::select! {
                _ = ticker.tick() => {
                    let batch = {
                        let mut rng = rand::rng(); 
                        let mut temp_batch = Vec::with_capacity(3000);
                        
                        for i in 0..3000 {
                            let base_price = 100.0 + rng.random_range(0.0..50.0);
                            temp_batch.push(Tick {
                                isin: symbols[i].clone(),
                                name: "CoinShares ETP".to_string(),
                                xetra_mid: base_price + rng.random_range(-0.05..0.05),
                                xetra_spr: rng.random_range(0.05..0.15),
                                lsx_spr: rng.random_range(0.06..0.16),
                                gettex_spr: rng.random_range(0.07..0.17),
                                trade_gate_spr: rng.random_range(0.08..0.18),
                                bid_size: rng.random_range(100.0..5000.0),
                                ask_size: rng.random_range(100.0..5000.0),
                                vol_xetra: rng.random_range(1000.0..50000.0),
                                vol_lsx: rng.random_range(500.0..20000.0),
                                vol_gettex: rng.random_range(100.0..10000.0),
                                vwap: base_price + rng.random_range(-1.0..1.0),
                                day_high: base_price + rng.random_range(1.0..5.0),
                                day_low: base_price - rng.random_range(1.0..5.0),
                                ytd_perf: rng.random_range(-15.0..25.0),
                                moving_avg: base_price + rng.random_range(-2.0..2.0),
                                rsi: rng.random_range(20.0..80.0),
                                macd: rng.random_range(-0.5..0.5),
                                bollinger: rng.random_range(-1.0..1.0),
                            });
                        }
                        temp_batch
                    };

                    counter_for_ws.fetch_add(1, Ordering::Relaxed);
                    let mut state = state_for_ws.lock().await;
                    *state = batch; 
                }
                
                _ = risk_ticker.tick() => {
                    let alert = {
                        let mut rng = rand::rng();
                        let random_index = rng.random_range(0..3000);
                        RiskAlert {
                            level: "CRITICAL".to_string(),
                            message: format!("Exposure limit breached on {}!", symbols[random_index]),
                        }
                    };
                    
                    app_for_ws.emit("RISK_UPDATE", alert).unwrap();
                }
            }
        }
    });

    // THREAD B: The UI Emitter
    tauri::async_runtime::spawn(async move {
        let mut ticker = time::interval(Duration::from_millis(33));
        loop {
            ticker.tick().await;
            let currently_paused = is_paused.load(Ordering::Relaxed);

            if !currently_paused {
                let state = state_for_emitter.lock().await;
                if !state.is_empty() {
                    app.emit("BATCH_UPDATE", state.clone()).unwrap();
                }
            }

            app.emit("METRICS_UPDATE", Metrics {
                throughput: throughput_for_emitter.load(Ordering::Relaxed), 
                is_paused: currently_paused,
            }).unwrap();
        }
    });

    // THREAD C: The Throughput Calculator
    tauri::async_runtime::spawn(async move {
        let mut interval = time::interval(Duration::from_secs(1));
        loop {
            interval.tick().await;
            let current_count = counter_for_calc.swap(0, Ordering::Relaxed);
            throughput_for_calc.store(current_count, Ordering::Relaxed);
        }
    });
}