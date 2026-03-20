@echo off
cd /d C:\Users\HP\OneDrive\Desktop\dashboard

echo Starting Flask backend...
start "" /MIN cmd /c "python app.py"

echo Waiting for backend to start...
timeout /t 3 >nul

echo Opening Login Page...
start "" "greenaiaibotlogin.html"

exit
