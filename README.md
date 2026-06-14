# 🚀 ASTRONEX - Planetary Weight & Age Calculator

A fun, interactive terminal application for kids to calculate their weight and age on different planets!

![Build](https://github.com/DFanso/planetary-calculator/actions/workflows/build.yml/badge.svg)

## Features

- 🌟 Retro spaceship command console interface
- 🎨 Colorful text and gradients
- ⌨️ Interactive keyboard navigation
- 🔢 Real-time weight and age calculations
- 🎮 Kid-friendly design with fun planet facts
- 🦀 Written in Rust — single static binary, ~400 KB

## Download Pre-built Binaries

Go to [Releases](https://github.com/DFanso/planetary-calculator/releases) to download:

- `astronex-macos` - macOS executable
- `astronex-linux` - Linux executable
- `astronex-windows.exe` - Windows executable

### Windows SmartScreen warning

Windows may show **"Windows protected your PC / Unknown publisher"** the first time you run
`astronex-windows.exe`. This is expected for a small open-source app that isn't yet signed with a
reputation-bearing certificate — it does not mean the file is unsafe. To run it:

1. Click **More info**.
2. Click **Run anyway**.

You can also clear the flag yourself in PowerShell before running:

```powershell
Unblock-File .\astronex-windows.exe
```

> Code signing via the [SignPath Foundation](https://signpath.org/) free OSS program is being set up
> to reduce this warning over time.

## Running from Source

### Prerequisites

- [Rust](https://rustup.rs) toolchain (stable)
- Terminal with true-color support

### Quick Start

```bash
cargo run --release
```

## How to Use

1. **Enter your age** - Type your Earth age in years, press ENTER
2. **Enter your weight** - Type your Earth weight in kg, press ENTER
3. **Select a planet** - Use arrow keys or j/k, press ENTER
4. **View results** - See your calculated age and weight!

### Controls

| Key        | Action               |
| ---------- | -------------------- |
| ↑/↓ or j/k | Navigate planet list |
| 1–4        | Quick-pick a planet  |
| ENTER      | Confirm input/select |
| B          | Go back to planets   |
| R          | Reset and start over |
| Q          | Quit                 |
| Ctrl+C     | Force quit anywhere  |

## Planet Options

- **Mars** - Gravity: 3.71 m/s², Orbit: 1.88 years
- **Jupiter** - Gravity: 24.79 m/s², Orbit: 11.86 years
- **Moon** - Gravity: 1.62 m/s², Orbit: 0.074 years
- **Venus** - Gravity: 8.87 m/s², Orbit: 0.61 years

## Calculations

- **Weight**: `(Earth Weight / 9.81) × Planet Gravity`
- **Age**: `Earth Age / Planet Orbital Period`

## Building from Source

```bash
# Build release binary (output: target/release/astronex)
cargo build --release

# Run directly
cargo run --release

# Cross-compile for a specific target
cargo build --release --target x86_64-pc-windows-msvc
```

## GitHub Actions

The project uses GitHub Actions to automatically build binaries for:

- macOS (x86_64)
- Linux (x86_64)
- Windows (x86_64)

Builds are created on every push to `master` and are available as workflow artifacts. Tagged pushes (`v*`) also publish to GitHub Releases.

---

Made with 💚 using [ratatui](https://ratatui.rs) and [crossterm](https://github.com/crossterm-rs/crossterm) for the terminal!
