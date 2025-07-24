@echo off
echo Starting WhatsApp Bulk Messaging Platform...
echo.

echo Starting Backend Server...
start "Backend Server" cmd /c "cd backend && npm start"

timeout /t 3

echo Starting Frontend Server...
start "Frontend Server" cmd /c "cd frontend && npm start"

echo.
echo Both servers are starting...
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Press any key to close this window...
pause > nul 