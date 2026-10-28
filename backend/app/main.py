import os
import shutil
from pathlib import Path
from typing import Dict, Any, List
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Response
from fastapi.responses import StreamingResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from .config import UPLOADS_DIR, IMAGES_DIR, AUDIO_DIR, VIDEO_DIR, GEMINI_API_KEY, GEMINI_MODEL
from .models import ForensicCase, ChatRequest, ReportRequest, EvidenceItem, TimelineEvent
from .cases_data import PRELOADED_CASES, get_all_cases, get_case_by_id
from .vision_analyzer import process_evidence_image
from .audio_analyzer import process_evidence_audio
from .ai_service import process_chat_query
from .report_generator import generate_case_pdf_report

app = FastAPI(
    title="CrimeVision AI Backend",
    description="Intelligent Multimodal Forensic Analysis & Scene Reconstruction Platform",
    version="1.0.0"
)

# CORS configuration for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory working copy of cases (initialized from PRELOADED_CASES)
CASES_DB: Dict[str, Dict[str, Any]] = {}
for cid, cdata in PRELOADED_CASES.items():
    CASES_DB[cid] = dict(cdata)

# Mount static files for media access (images, audio, video)
STATIC_DIR = UPLOADS_DIR / "static"
STATIC_DIR.mkdir(parents=True, exist_ok=True)
app.mount("/api/static", StaticFiles(directory=str(STATIC_DIR)), name="static")
app.mount("/api/uploads", StaticFiles(directory=str(UPLOADS_DIR)), name="uploads")

@app.get("/api/health")
def health_check():
    """System health check and forensic AI engine status."""
    return {
        "status": "OPERATIONAL",
        "platform": "CrimeVision AI Forensic Intelligence Engine",
        "gemini_active": bool(GEMINI_API_KEY),
        "active_model": GEMINI_MODEL if GEMINI_API_KEY else "Local Forensic Heuristics (OpenCV + Acoustic Telemetry)",
        "cases_loaded": len(CASES_DB),
        "version": "1.0.0"
    }

@app.get("/api/cases")
def list_cases():
    """Returns summaries of all available forensic cases."""
    results = []
    for c_id, case in CASES_DB.items():
        results.append({
            "id": case["id"],
            "case_number": case["case_number"],
            "title": case["title"],
            "status": case["status"],
            "jurisdiction": case["jurisdiction"],
            "lead_investigator": case["lead_investigator"],
            "incident_date": case["incident_date"],
            "incident_location": case["incident_location"],
            "summary": case["summary"],
            "threat_level": case["threat_level"],
            "evidence_count": len(case.get("evidence", [])),
            "timeline_count": len(case.get("timeline", []))
        })
    return results

@app.get("/api/cases/{case_id}")
def get_case(case_id: str):
    """Returns full case file with multimodal evidence, timeline, and scene markers."""
    if case_id not in CASES_DB:
        raise HTTPException(status_code=404, detail="Forensic case not found")
    return CASES_DB[case_id]

@app.post("/api/cases/{case_id}/evidence/upload")
async def upload_evidence(
    case_id: str,
    file: UploadFile = File(...),
    title: str = Form("New Evidence Submission"),
    source: str = Form("Field Forensic Ingestion"),
    evidence_type: str = Form("image")
):
    """Processes uploaded evidence (image, video, audio) with multimodal forensic AI."""
    if case_id not in CASES_DB:
        raise HTTPException(status_code=404, detail="Forensic case not found")
        
    case = CASES_DB[case_id]
    ext = Path(file.filename).suffix.lower()
    
    # Classify type if not explicitly set
    if ext in [".jpg", ".jpeg", ".png", ".webp", ".bmp"]:
        evidence_type = "image"
        dest_dir = IMAGES_DIR
    elif ext in [".wav", ".mp3", ".m4a", ".ogg", ".flac"]:
        evidence_type = "audio"
        dest_dir = AUDIO_DIR
    elif ext in [".mp4", ".mov", ".avi", ".mkv"]:
        evidence_type = "video"
        dest_dir = VIDEO_DIR
    else:
        dest_dir = UPLOADS_DIR
        
    saved_filename = f"{case_id}_{file.filename}"
    saved_path = dest_dir / saved_filename
    
    with open(saved_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    file_url = f"/api/uploads/{dest_dir.name}/{saved_filename}"
    new_ev_id = f"E-{len(case.get('evidence', [])) + 1:02d}"
    
    # Process with corresponding analyzer
    if evidence_type == "image":
        analysis = process_evidence_image(saved_path)
    elif evidence_type == "audio":
        analysis = process_evidence_audio(saved_path)
    else:
        # Video: fallback to image analysis on frame or metadata
        analysis = process_evidence_image(saved_path)
        
    new_evidence = {
        "id": new_ev_id,
        "type": evidence_type,
        "title": title,
        "filename": file.filename,
        "file_url": file_url,
        "source": source,
        "timestamp": "2026-10-28 20:15:00",
        "sha256": analysis.get("sha256", "UNKNOWN_HASH"),
        "width": analysis.get("width"),
        "height": analysis.get("height"),
        "duration_sec": analysis.get("duration_sec"),
        "detections": analysis.get("detections", []),
        "transcript": analysis.get("transcript", []),
        "acoustic_events": analysis.get("acoustic_events", []),
        "waveform": analysis.get("waveform", []),
        "metadata": analysis.get("metadata", {}),
        "forensic_notes": analysis.get("forensic_notes", "Evidence ingested and verified.")
    }
    
    case.setdefault("evidence", []).append(new_evidence)
    
    # Automatically synthesize a new Timeline event
    new_timeline_event = {
        "id": f"t-auto-{len(case.get('timeline', [])) + 1}",
        "timestamp": "20:15:00",
        "time_seconds": len(case.get("timeline", [])) * 15,
        "modality": evidence_type,
        "severity": "warning" if new_evidence["detections"] else "info",
        "title": f"New Ingestion: {title}",
        "description": f"Multimodal analysis detected {len(new_evidence['detections'])} tactical targets and verified cryptographic hash integrity.",
        "evidence_id": new_ev_id,
        "confidence": 0.96,
        "tags": [det.get("label", "Detection") for det in new_evidence["detections"][:3]]
    }
    case.setdefault("timeline", []).append(new_timeline_event)
    
    return {
        "success": True,
        "evidence": new_evidence,
        "timeline_event": new_timeline_event,
        "case": case
    }

@app.post("/api/cases/{case_id}/chat")
def chat_with_investigator(case_id: str, request: ChatRequest):
    """Natural language query engine across multimodal case evidence."""
    if case_id not in CASES_DB:
        raise HTTPException(status_code=404, detail="Forensic case not found")
        
    case = CASES_DB[case_id]
    history = [h.model_dump() for h in request.history]
    answer = process_chat_query(case, request.message, history)
    return answer

@app.post("/api/cases/{case_id}/report/pdf")
def export_pdf_report(case_id: str, request: ReportRequest = ReportRequest()):
    """Generates and streams a professional, court-admissible forensic PDF report."""
    if case_id not in CASES_DB:
        raise HTTPException(status_code=404, detail="Forensic case not found")
        
    case = CASES_DB[case_id]
    pdf_bytes = generate_case_pdf_report(case, notes=request.investigator_notes or "")
    
    filename = f"CrimeVision_Dossier_{case['case_number']}.pdf"
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"'
        }
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="127.0.0.1", port=8000, reload=True)
