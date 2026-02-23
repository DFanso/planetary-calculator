# 🚀 ASTRONEX - Planetary Weight & Age Calculator

A fun, interactive terminal application for kids to calculate their weight and age on different planets!

![Build](https://github.com/DFanso/planetary-calculator/actions/workflows/build.yml/badge.svg)

## Features

- 🌟 Retro spaceship command console interface
- 🎨 Colorful text and gradients
- ⌨️ Interactive keyboard navigation
- 🔢 Real-time weight and age calculations
- 🎮 Kid-friendly design with fun planet facts

## Download Pre-built Binaries

Go to [Releases](https://github.com/DFanso/planetary-calculator/releases) to download:

- `astronex-macos` - macOS executable
- `astronex-linux` - Linux executable
- `astronex-windows.exe` - Windows executable

## Running from Source

### Prerequisites

- [Bun](https://bun.sh) runtime installed
- Terminal with color support

### Quick Start

```bash
bun install
bun index.js
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
| ENTER      | Select planet        |
| B          | Go back to planets   |
| R          | Reset and start over |
| Q          | Quit                 |

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
# Install dependencies
bun install

# Run in development
bun index.js

# Build for current platform
bun build index.js --compile --outfile astronex
```

## GitHub Actions

The project uses GitHub Actions to automatically build binaries for:

- macOS (x64)
- Linux (x64)
- Windows (x64)

Builds are created on every push to main and are available as workflow artifacts or in Releases.

---

Made with 💚 using [Ink](https://github.com/vadimdemedes/ink) and React for the terminal!
