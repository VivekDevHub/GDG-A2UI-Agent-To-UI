#!/usr/bin/env bash
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR"

if [ ! -d "venv" ]; then
    echo "Creating python virtualenv..."
    python3 -m venv venv
fi

source venv/bin/activate
echo "Installing server dependencies..."
pip install -r requirements.txt

echo "Starting Google ADK A2UI Backend on http://localhost:10002..."
python main.py
