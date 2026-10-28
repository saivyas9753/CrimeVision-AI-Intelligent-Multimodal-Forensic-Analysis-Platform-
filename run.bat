@echo off
title CrimeVision AI - Launcher
color 0B

echo =========================================================================
echo    CRIMEVISION AI - Intelligent Multimodal Forensic Analysis Platform
echo =========================================================================
echo.
echo [1/3] Starting Forensic Intelligence Backend (FastAPI on Port 8000)...
start "CrimeVision AI - Backend" cmd /k "python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload"

timeout /t 2 /nobreak > nul

echo [2/3] Starting Tactical Forensic Dashboard (Vite Frontend on Port 5173)...
start "CrimeVision AI - Frontend" cmd /k "cd frontend && npm run dev"

timeout /t 3 /nobreak > nul

echo [3/3] Opening CrimeVision AI Dashboard in default browser...
start http://localhost:5173

echo.
echo =========================================================================
echo  CrimeVision AI is running!
echo  - Frontend Dashboard: http://localhost:5173
echo  - Backend API:        http://localhost:8000
echo  - Interactive Docs:   http://localhost:8000/docs
echo =========================================================================
pause
