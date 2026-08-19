mod inhibit;

use inhibit::InhibitState;
use tauri::{Manager, WindowEvent};

#[tauri::command]
fn inhibit_system_sleep(state: tauri::State<InhibitState>) -> Result<(), String> {
    state.inhibit()
}

#[tauri::command]
fn release_system_sleep(state: tauri::State<InhibitState>) -> Result<(), String> {
    state.release()
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .manage(InhibitState::new())
        .invoke_handler(tauri::generate_handler![
            inhibit_system_sleep,
            release_system_sleep
        ])
        .on_window_event(|window, event| {
            if matches!(
                event,
                WindowEvent::Destroyed | WindowEvent::CloseRequested { .. }
            ) {
                let _ = window.state::<InhibitState>().release();
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tabawake");
}
