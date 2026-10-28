import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
UPLOADS_DIR = BASE_DIR / "uploads"
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)

# Evidence subdirectories
IMAGES_DIR = UPLOADS_DIR / "images"
AUDIO_DIR = UPLOADS_DIR / "audio"
VIDEO_DIR = UPLOADS_DIR / "video"
REPORTS_DIR = UPLOADS_DIR / "reports"

for d in [IMAGES_DIR, AUDIO_DIR, VIDEO_DIR, REPORTS_DIR]:
    d.mkdir(parents=True, exist_ok=True)

# Gemini API configuration (Optional - fallback to intelligent local engine if absent)
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")

PORT = int(os.getenv("PORT", 8000))
HOST = os.getenv("HOST", "127.0.0.1")
