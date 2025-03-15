#!/bin/bash

# Simple script to run a local server for the CPW Archery game

echo "Starting local server for CPW Archery game..."
echo "Open your browser and navigate to http://localhost:8000/cpw-archery.html"

# Check if Python is installed
if command -v python3 &>/dev/null; then
    python3 -m http.server
elif command -v python &>/dev/null; then
    python -m SimpleHTTPServer
else
    echo "Error: Python is not installed. Please install Python or use another local server."
    exit 1
fi 