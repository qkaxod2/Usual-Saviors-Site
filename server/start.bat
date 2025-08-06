@echo off
echo Starting Usual Saviors Server...
echo.

REM Node.js가 설치되어 있는지 확인
node --version >nul 2>&1
if errorlevel 1 (
    echo Error: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM 필요한 패키지 설치
echo Installing dependencies...
npm install

REM 서버 시작
echo.
echo Starting server on http://localhost:3000
echo Press Ctrl+C to stop the server
echo.
npm start

pause 