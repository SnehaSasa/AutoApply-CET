#!/usr/bin/env bash
# Helper: start backend and print quick instructions
echo "1) Start backend:"
echo "   cd backend && python -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt"
echo "   uvicorn app.main:app --reload --port 8000"
echo ""
echo "2) Build extension popup:"
echo "   cd extension && npm install && npm run build"
echo "   Load 'dist' folder as unpacked extension in chrome://extensions"
