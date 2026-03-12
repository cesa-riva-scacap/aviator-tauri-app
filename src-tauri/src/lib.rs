use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Arc;
use tauri::{Manager, State};

mod types;
mod ws;        // The external WebSocket client
mod ws_local;  // The standalone internal mock generator

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

// 1. Create a struct to hold our global pause state
pub struct AppState {
    is_paused: Arc<AtomicBool>,
}

// 2. The command called by React's handleToggleWorker
#[tauri::command]
fn toggle_pause(state: State<'_, AppState>) {
  let current = state.is_paused.load(Ordering::Relaxed);
  state.is_paused.store(!current, Ordering::Relaxed);
  println!("Frontend requested pause toggle. Currently paused: {}", !current);  
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // 3. Initialize the atomic boolean (defaults to false)
    let is_paused = Arc::new(AtomicBool::new(false));

    // Clone it once to pass to our WebSocket client
    let is_paused_for_ws = is_paused.clone();

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            // Give Tauri the state so `toggle_pause` can access it later
            app.manage(AppState { is_paused });

            // ==========================================
            // 🔄 TOGGLE ENVIRONMENT HERE
            // ==========================================
            
            // OPTION A: Standalone Demo Mode (No backend required - PM ready!)
            ws_local::start_local_mock_client(app.handle().clone(), is_paused_for_ws);

            // OPTION B: Real Network Mode (Requires Axum server)
            // ws::start_websocket_client(app.handle().clone(), is_paused_for_ws);

            // ==========================================
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![greet, toggle_pause])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

