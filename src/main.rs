use tauri::{
    image::Image,
    menu::{Menu, MenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    Manager, WebviewUrl, WebviewWindowBuilder, WindowEvent,
};

fn main() {
    let app_version = env!("CARGO_PKG_VERSION");
    let app_title = format!("WhatsApp v{}", app_version);

    tauri::Builder::default()
        .setup(move |app| {
            // Load tray icon
            let tray_icon = app
                .default_window_icon()
                .cloned()
                .unwrap_or_else(|| {
                    let icon_bytes = include_bytes!("../icons/32x32.png");
                    Image::from_bytes(icon_bytes).expect("Failed to load tray icon")
                });

            // Create main window dynamically with initialization script
            let lock_script = include_str!("lock.js");
            let _window = WebviewWindowBuilder::new(
                app,
                "main",
                WebviewUrl::External("https://web.whatsapp.com".parse().expect("Valid URL")),
            )
            .title(&app_title)
            .inner_size(1150.0, 780.0)
            .min_inner_size(650.0, 500.0)
            .resizable(true)
            .user_agent("Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36")
            .initialization_script(lock_script)
            .build()?;

            // Build Tray Context Menu
            let title_item = MenuItem::with_id(app, "info", &app_title, false, None::<&str>)?;
            let lock_item = MenuItem::with_id(app, "lock", "🔒 Uygulamayı Kilitle", true, None::<&str>)?;
            let pin_item = MenuItem::with_id(app, "change_pin", "🔑 PIN Ayarla / Değiştir", true, None::<&str>)?;
            let toggle_item = MenuItem::with_id(app, "toggle", "Göster / Gizle", true, None::<&str>)?;
            let reload_item = MenuItem::with_id(app, "reload", "Yeniden Yükle", true, None::<&str>)?;
            let quit_item = MenuItem::with_id(app, "quit", "Çıkış", true, None::<&str>)?;
            let menu = Menu::with_items(
                app,
                &[&title_item, &lock_item, &pin_item, &toggle_item, &reload_item, &quit_item],
            )?;

            // Setup System Tray
            let _tray = TrayIconBuilder::new()
                .icon(tray_icon)
                .tooltip(&app_title)
                .menu(&menu)
                .show_menu_on_left_click(false)
                .on_menu_event(|app, event| match event.id.as_ref() {
                    "lock" => {
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.eval("if (window.__waLock) window.__waLock();");
                            let _ = window.show();
                            let _ = window.set_focus();
                        }
                    }
                    "change_pin" => {
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.eval("if (window.__waChangePin) window.__waChangePin();");
                            let _ = window.show();
                            let _ = window.set_focus();
                        }
                    }
                    "toggle" => {
                        if let Some(window) = app.get_webview_window("main") {
                            if window.is_visible().unwrap_or(false) {
                                let _ = window.hide();
                            } else {
                                let _ = window.show();
                                let _ = window.set_focus();
                            }
                        }
                    }
                    "reload" => {
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.eval("window.location.reload();");
                        }
                    }
                    "quit" => {
                        app.exit(0);
                    }
                    _ => {}
                })
                .on_tray_icon_event(|tray, event| {
                    if let TrayIconEvent::Click {
                        button: MouseButton::Left,
                        button_state: MouseButtonState::Up,
                        ..
                    } = event
                    {
                        let app = tray.app_handle();
                        if let Some(window) = app.get_webview_window("main") {
                            if window.is_visible().unwrap_or(false) {
                                let _ = window.hide();
                            } else {
                                let _ = window.show();
                                let _ = window.set_focus();
                            }
                        }
                    }
                })
                .build(app)?;

            Ok(())
        })
        .on_window_event(|window, event| {
            if let WindowEvent::CloseRequested { api, .. } = event {
                // Prevent window from closing, lock & hide to system tray instead
                api.prevent_close();
                if let Some(wv) = window.app_handle().get_webview_window(window.label()) {
                    let _ = wv.eval("if (window.__waLock) window.__waLock();");
                }
                let _ = window.hide();
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
