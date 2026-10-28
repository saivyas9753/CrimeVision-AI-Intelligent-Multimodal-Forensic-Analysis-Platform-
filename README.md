# CrimeVision AI — Intelligent Multimodal Forensic Analysis Platform

![CrimeVision AI Status](https://img.shields.io/badge/System-ONLINE-00f0ff?style=flat-square)
![Forensic Pipeline](https://img.shields.io/badge/AI%20Pipeline-Multimodal%20Fusion-38bdf8?style=flat-square)
![Court-Admissible Dossier](https://img.shields.io/badge/ReportLab-PDF%20Engine-10b981?style=flat-square)
![Chain of Custody](https://img.shields.io/badge/Integrity-SHA--256%20Verified-f59e0b?style=flat-square)

**CrimeVision AI** is an advanced forensic intelligence platform designed to automate crime scene reconstruction and digital evidence analysis using multimodal artificial intelligence. By integrating **image, video, and audio data**, the platform detects people, weapons, and objects, analyzes kinetic actions, and fuses visual evidence with witness audio transcripts into a unified, chronological forensic timeline.

---

## 🎯 Key Capabilities

### 1. Multimodal Evidence Ingestion & Computer Vision
- **Optical Object & Weapon Detection**: Precision bounding box tagging for firearms (e.g. Glock 19), edged weapons, persons of interest, and contraband.
- **Interactive Forensic Canvas**: Zoom, pan, category filter (Weapons, Persons, Objects, Anomalies), confidence threshold sliders, and CCTV HUD viewfinders.
- **Cryptographic Chain of Custody**: Automated SHA-256 integrity hash verification and EXIF sensor metadata extraction.

### 2. Forensic Acoustic Telemetry & Diarization
- **Waveform Inspection Canvas**: Interactive playhead scrubbing across normalized amplitude spectrums.
- **Acoustic Anomaly Detection**: Muzzle blast / gunshot shockwave detection (>135 dB), high-decibel panic screams, engine cavitation, and structural impact markers.
- **Diarized Witness Transcripts**: Speaker separation (Dispatchers, Witnesses, Suspects) with real-time vocal stress analysis and click-to-jump playhead synchronization.

### 3. Unified Chronological Event Reconstruction
- **Cross-Modal Fusion**: Correlates CCTV camera timestamps with 911 dispatch calls, audio spikes, and physical ballistics.
- **Interactive Simulation**: Step-through automated crime scene reconstruction walkthrough.
- **Evidence Linking**: Instant deep-links between timeline events and raw multimedia items.

### 4. 2D Tactical Crime Scene Blueprint
- **Spatial Reconstruction**: Architectural layout showing camera coverage angles (FOV vision cones), suspect entry vectors, ballistic trajectories, and escape routes.
- **Interactive Markers**: Inspect tactical coordinates, forensic point-of-interest details, and camera parameters.

### 5. Persistent AI Forensic Investigator Assistant
- **Natural Language Interrogation**: Conversational multi-turn assistant trained to answer complex investigative queries.
- **Citation Engine**: Cross-references answers with explicit evidence tags (`[E-01 @ 22:14:18]`, `[911 Audio @ 00:23]`).
- **Hybrid Intelligence**: Works in offline expert heuristic mode out of the box, with instant plug-and-play support for Google Gemini 2.5/1.5 Multimodal APIs.

### 6. High-Performance Forensic PDF Report Engine
- **Court-Admissible Dossier**: One-click generation of comprehensive forensic examination reports using Python's `reportlab` engine.
- **Complete Documentation**: Includes Case Header, Chain of Custody (SHA-256 hashes), Computer Vision Detection Matrix, Chronological Reconstruction, Acoustic Diarization Table, Forensic Hypotheses, and Official Sign-off.

---

## 📁 Preloaded Real-World Forensic Cases

1. **Case #CV-2026-0892: "Armed Robbery & Ballistics at Metro QuickMart"**
   - 4K Entrance CCTV, counter surveillance closeup, 911 clerk call audio with 138.4 dB gunshot impulse, 9mm ballistic ceiling strike, suspect trajectory.
2. **Case #CV-2026-1140: "Industrial Wharf Perimeter Breach & Contraband Transfer"**
   - Long-wave infrared FLIR thermal imagery (>2800°C cutter torch bloom), underwater hydrophone motor cavitation, cargo container breach.
3. **Case #CV-2026-0417: "Central Transit Station Mezzanine Aggravated Assault"**
   - 4K Dome PTZ footage, tanto tactical blade weapon detection, bystander audio statement, crowd panic scream analysis.

---

## 🚀 Quick Start Guide

### 1-Click Launch (Windows)
Double-click `run.bat` in the project root directory. This will:
1. Start the FastAPI backend on `http://127.0.0.1:8000`
2. Start the Vite React frontend on `http://localhost:5173`
3. Launch your default browser directly into the platform.

### Manual Setup

#### Backend Setup
```bash
# Navigate to project root
cd "c:\Users\Lenovo\Desktop\crime vision"

# Install backend dependencies
python -m pip install -r backend/requirements.txt

# Start FastAPI server
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```

#### Frontend Setup
```bash
# In a new terminal, navigate to frontend
cd frontend

# Install node dependencies
npm install

# Start Vite development server
npm run dev
```

Open `http://localhost:5173` in your web browser.

---

## ⚙️ Environment Variables (Optional)

CrimeVision AI operates out-of-the-box with full offline forensic heuristics. To activate real-time Google Gemini Multimodal Cloud AI:
1. Create a `.env` file in the project root (or copy `.env.example`).
2. Add your Gemini API Key:
```env
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash
```

---

## 🏛️ System Architecture

```
crime-vision/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI application & REST endpoints
│   │   ├── config.py            # Environment & directory paths
│   │   ├── models.py            # Pydantic data schemas
│   │   ├── cases_data.py        # Pre-loaded rich forensic cases
│   │   ├── vision_analyzer.py   # Image/video CV & bounding box engine
│   │   ├── audio_analyzer.py    # Waveform & acoustic transient engine
│   │   ├── ai_service.py        # Hybrid AI conversational investigator
│   │   ├── report_generator.py  # Court-admissible ReportLab PDF generator
│   │   ├── generate_assets.py   # Surveillance image generator
│   │   └── generate_audio_assets.py # Acoustic telemetry wave generator
│   ├── requirements.txt
│   └── uploads/                 # Static surveillance media & user uploads
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx       # Tactical HUD & Case switcher
│   │   │   ├── EvidenceViewer.jsx # Bounding box canvas & metadata inspector
│   │   │   ├── AudioAnalyzer.jsx # Synchronized waveform & transcript player
│   │   │   ├── TimelineView.jsx # Unified chronological event timeline
│   │   │   ├── SceneMap.jsx     # 2D tactical blueprint reconstruction
│   │   │   ├── AIChatDrawer.jsx # Natural language forensic interrogation
│   │   │   ├── EvidenceUploadModal.jsx # Live evidence drag-and-drop
│   │   │   └── ReportModal.jsx  # Dossier preview & PDF export
│   │   ├── services/
│   │   │   └── api.js           # REST API client
│   │   ├── App.jsx              # Main tactical workspace layout
│   │   └── index.css            # Dark tactical forensic styling
│   ├── vite.config.js
│   └── package.json
├── run.bat                      # 1-Click Windows startup script
└── README.md
```

---

## ⚖️ Legal & Forensic Compliance
- **Digital Chain of Custody**: Cryptographic verification conforms to standard digital forensics hashing protocols (NIST SP 800-86).
- **Evidence Integrity**: All original ingested assets maintain read-only hash permanence.
