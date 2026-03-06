@echo off
echo Starting Backend...
start cmd /k "cd backend && pip install -r requirements.txt && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"

echo Starting Main Frontend...
start cmd /k "npm run dev"

echo Starting Technician Frontend...
start cmd /k "cd technician-frontend && npm run dev"

echo All services started in separate windows!
