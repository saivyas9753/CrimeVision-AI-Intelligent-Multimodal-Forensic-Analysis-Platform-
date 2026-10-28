from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class BoundingBox(BaseModel):
    x: float  # Percentage 0-100 from left
    y: float  # Percentage 0-100 from top
    w: float  # Width percentage 0-100
    h: float  # Height percentage 0-100
    label: str
    confidence: float
    category: str = "object"  # weapon, person, object, vehicle, anomaly
    color: Optional[str] = None
    attributes: Dict[str, Any] = Field(default_factory=dict)

class Detection(BaseModel):
    id: str
    label: str
    category: str
    confidence: float
    bbox: Optional[BoundingBox] = None
    description: str
    timestamp: Optional[str] = None
    flags: List[str] = Field(default_factory=list)

class TranscriptSegment(BaseModel):
    id: str
    start: float  # Seconds
    end: float    # Seconds
    speaker: str  # e.g., "Dispatcher", "Clerk (Witness)", "Suspect 1"
    text: str
    confidence: float
    stress_level: Optional[float] = None  # 0.0 - 1.0
    acoustic_tags: List[str] = Field(default_factory=list)

class AcousticEvent(BaseModel):
    id: str
    timestamp_sec: float
    time_formatted: str
    event_type: str  # e.g. "Gunshot Discharge", "Glass Breakage", "Vocal Distress Spike", "Door Forced"
    confidence: float
    decibels: float
    frequency_band: str
    description: str

class EvidenceItem(BaseModel):
    id: str
    type: str  # "image", "video", "audio"
    title: str
    filename: str
    file_url: str
    source: str
    timestamp: str
    sha256: str
    duration_sec: Optional[float] = None
    width: Optional[int] = None
    height: Optional[int] = None
    detections: List[Detection] = Field(default_factory=list)
    transcript: List[TranscriptSegment] = Field(default_factory=list)
    acoustic_events: List[AcousticEvent] = Field(default_factory=list)
    waveform: List[float] = Field(default_factory=list)
    metadata: Dict[str, Any] = Field(default_factory=dict)
    forensic_notes: Optional[str] = None

class TimelineEvent(BaseModel):
    id: str
    timestamp: str  # ISO or time string (e.g. "22:14:05")
    time_seconds: Optional[float] = None
    modality: str   # "visual", "audio", "hybrid", "dispatch"
    severity: str   # "info", "warning", "critical"
    title: str
    description: str
    evidence_id: Optional[str] = None
    confidence: float = 0.95
    tags: List[str] = Field(default_factory=list)

class SceneMarker(BaseModel):
    id: str
    label: str
    type: str  # "camera", "suspect_entry", "victim", "weapon_drop", "escape_route", "sensor"
    x: float   # 0-100 coordinate on blueprint
    y: float   # 0-100 coordinate on blueprint
    rotation: Optional[float] = 0.0
    details: str

class ForensicCase(BaseModel):
    id: str
    case_number: str
    title: str
    status: str  # "Active", "Under Review", "Court Ready", "Cold Case"
    jurisdiction: str
    lead_investigator: str
    incident_date: str
    incident_location: str
    summary: str
    threat_level: str  # "High", "Critical", "Moderate"
    evidence: List[EvidenceItem] = Field(default_factory=list)
    timeline: List[TimelineEvent] = Field(default_factory=list)
    scene_markers: List[SceneMarker] = Field(default_factory=list)
    chain_of_custody: List[Dict[str, str]] = Field(default_factory=list)
    forensic_hypotheses: List[str] = Field(default_factory=list)

class ChatMessage(BaseModel):
    role: str  # "user", "assistant", "system"
    content: str
    citations: List[Dict[str, Any]] = Field(default_factory=list)
    timestamp: Optional[str] = None

class ChatRequest(BaseModel):
    message: str
    case_id: str
    history: List[ChatMessage] = Field(default_factory=list)

class ReportRequest(BaseModel):
    investigator_notes: Optional[str] = None
    include_transcripts: bool = True
    include_detections: bool = True
    include_chain_of_custody: bool = True
