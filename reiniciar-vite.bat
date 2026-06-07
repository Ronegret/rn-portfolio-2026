@echo off
echo Reiniciando servidor Vite...
taskkill /F /IM node.exe /T >nul 2>&1
timeout /t 2 /nobreak >nul
cd /d "C:\Users\rodri\Desktop\RN_porfolio_2026"
start cmd /k "npm run dev"
