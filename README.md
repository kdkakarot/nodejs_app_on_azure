# PDF Automation Website

Extract text from PDF files using a web interface.

## Quick Start

### Option 1: Use the Startup Script
```powershell
.\start.ps1
```

### Option 2: Manual Start

**Terminal 1 - Backend:**
```powershell
cd "D:\OneDrive\Code explorations\NodeJS_app_on_Azure\backend"
node dist/server.js
```

**Terminal 2 - Frontend:**
```powershell
cd "D:\OneDrive\Code explorations\NodeJS_app_on_Azure\frontend"
npm run dev
```

**Access:** http://localhost:5173

## Usage

1. Place PDF files in the `input_PDF` folder
2. Open http://localhost:5173 in your browser
3. Enter paths:
   - **Input:** `D:\OneDrive\Code explorations\NodeJS_app_on_Azure\input_PDF`
   - **Output:** `D:\OneDrive\Code explorations\NodeJS_app_on_Azure\output_extract`
4. Click **Submit Job**
5. Watch real-time progress and logs
6. Check the `output_extract` folder for .txt files

## Architecture

- **Frontend:** React + TypeScript + Vite (port 5173)
- **Backend:** Node.js + Express + TypeScript (port 4000)
- **Python Processor:** pdf_processor.exe (extracts PDF text)

## Folders

- `backend/` - Express API server
- `frontend/` - React web UI
- `pdf_processin_code/` - Python source code
- `pdf_processin_exe/` - Python executable
- `input_PDF/` - Place PDFs here
- `output_extract/` - Text extracts appear here

## Development

To rebuild after code changes:

**Backend:**
```powershell
cd backend
npm run build
```

**Python exe:**
```powershell
cd "D:\OneDrive\Code explorations\NodeJS_app_on_Azure"
.\.venv\Scripts\pyinstaller.exe --onefile --distpath "pdf_processin_exe" --name pdf_processor "pdf_processin_code/pdf_processor.py"
```
