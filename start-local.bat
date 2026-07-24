@echo off
cd /d "%~dp0"
start "" http://localhost:8080
powershell -NoProfile -ExecutionPolicy Bypass -Command "python -m http.server 8080"
