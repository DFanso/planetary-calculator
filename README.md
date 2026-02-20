# 🚀 ASTRO-CALC 9000 - Planetary Weight & Age Calculator

A fun, interactive terminal application for kids (ages 8-12) to calculate their weight and age on different planets!

## Features

- 🌟 Retro spaceship command console interface
- 🎨 Colorful ASCII art for each planet
- ⌨️ Interactive keyboard navigation
- 🔢 Real-time weight and age calculations
- 🎮 Kid-friendly design with fun planet facts

## Prerequisites

- [Bun](https://bun.sh) runtime installed
- Terminal with TTY support (iTerm2, Terminal.app, Windows Terminal, etc.)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd planetary-calculator
```

2. Install dependencies:
```bash
bun install
```

## Running the App

### Method 1: Direct Command
```bash
bun index.js
```

### Method 2: Using the Launch Script
```bash
./run.sh
```

### Method 3: Force Demo Mode
```bash
bun index.js < /dev/null
```

## How to Use

1. **Boot Sequence**: Watch the cool loading animation
2. **Enter Your Age**: Type your Earth age in years
3. **Enter Your Weight**: Type your Earth weight in kilograms
4. **Select a Planet**: Use arrow keys (↑↓) or j/k to navigate, press ENTER to select
   - Or press numbers 1-4 for quick selection
5. **View Results**: See your calculated age and weight on the selected planet!

## Planet Options

- 🔴 **Mars**: The Red Planet (Gravity: 3.71 m/s²)
- 🟤 **Jupiter**: The Gas Giant (Gravity: 24.79 m/s²)
- 🌙 **Moon**: Earth's Satellite (Gravity: 1.62 m/s²)
- 🟡 **Venus**: The Morning Star (Gravity: 8.87 m/s²)

## Demo Mode

When run in environments without keyboard input (like CI/CD or some IDEs), the app automatically runs in demo mode with preset values.

## Calculations

- **Weight Formula**: `(Earth Weight / 9.81) × Planet Surface Gravity`
- **Age Formula**: `Earth Age / Planet Orbital Period in Earth Years`

## Troubleshooting

### "Raw mode is not supported" Error
This happens when running in a non-interactive environment. The app will automatically switch to demo mode.

### No Colors Showing
Make sure your terminal supports ANSI colors. Most modern terminals do.

### Keyboard Not Working
Ensure you're running in a real terminal, not an IDE's output panel.

## Educational Value

This app helps students understand:
- Gravity differences across celestial bodies
- Orbital periods and their effect on "years"
- Basic physics concepts in a fun, interactive way

---

Made with 💚 using [Ink](https://github.com/vadimdemedes/ink) and React for the terminal!
