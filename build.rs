fn main() {
    // Embed the application icon into the Windows executable so `astronex.exe`
    // shows the ASTRONEX logo in Explorer, the taskbar, etc. This is a no-op
    // on non-Windows targets (macOS/Linux executables have no icon resource).
    if std::env::var("CARGO_CFG_TARGET_OS").as_deref() == Ok("windows") {
        println!("cargo:rerun-if-changed=logo.ico");
        let mut res = winresource::WindowsResource::new();
        res.set_icon("logo.ico");
        if let Err(err) = res.compile() {
            // Don't hard-fail the build if the resource compiler is unavailable;
            // surface it as a warning instead.
            println!("cargo:warning=failed to embed Windows icon: {err}");
        }
    }
}
