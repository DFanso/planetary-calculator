#!/bin/bash

# Run the ASTRO-CALC 9000 app
echo "🚀 Starting ASTRO-CALC 9000..."
echo ""
echo "This app works in two modes:"
echo "1. Interactive Mode - When run in a terminal with keyboard support"
echo "2. Demo Mode - When run without TTY (like in VS Code output)"
echo ""
echo "Press any key to continue..."
read -n 1 -s

# Clear screen for full experience
clear

# Run the app
exec bun index.js