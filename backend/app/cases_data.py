from typing import Dict, List
import copy
from .models import ForensicCase, EvidenceItem, Detection, BoundingBox, TranscriptSegment, AcousticEvent, TimelineEvent, SceneMarker

PRELOADED_CASES: Dict[str, Dict] = {
    "CV-2026-0892": {
        "id": "CV-2026-0892",
        "case_number": "CR-2026-0892-METRO",
        "title": "Armed Robbery & Ballistics at Metro QuickMart",
        "status": "Active Investigation",
        "jurisdiction": "Metro Police Dept - Forensic Intelligence Division",
        "lead_investigator": "Detective Insp. Marcus Vance (Badge #4418)",
        "incident_date": "2026-10-24 22:14:02 EST",
        "incident_location": "842 Grand Avenue, Sector 4 Commercial District",
        "threat_level": "Critical",
        "summary": "Armed suspect in dark hooded apparel and neoprene gloves breached commercial store at 22:13:58. Brandished a semi-automatic handgun, forced the clerk to empty the registers, discharged one 9mm round into the ceiling display as an intimidation tactic, and fled northbound toward the alleyway. Multimodal fusion links CCTV footage, acoustic gunshot signatures, and the 911 emergency transcript.",
        "chain_of_custody": [
            {"date": "2026-10-24 22:45", "officer": "Ofc. H. Chen", "action": "CCTV DVR hard drive seized and hash-verified."},
            {"date": "2026-10-24 23:12", "officer": "Det. M. Vance", "action": "911 Dispatch audio ingested into CrimeVision AI platform."},
            {"date": "2026-10-25 01:20", "officer": "Forensic Tech S. Miller", "action": "Spent 9mm casing recovered from aisle 2 display panel."}
        ],
        "forensic_hypotheses": [
            "Primary suspect displays left-hand weapon manipulation with specialized grip technique.",
            "Suspect entered with pre-planned knowledge of register panic button placement, bypassing cashier counter perimeter.",
            "Acoustic impulse analysis at 22:14:38 confirms supersonic muzzle blast signature matching 9x19mm Parabellum at 138.4 dB.",
            "Getaway vehicle likely positioned at North Alley mouth (unmonitored blind spot)."
        ],
        "scene_markers": [
            {"id": "m1", "label": "Cam 01 - North Entrance", "type": "camera", "x": 15, "y": 20, "rotation": 45, "details": "4K HikVision Dome covering storefront entry & outer sidewalk"},
            {"id": "m2", "label": "Cam 02 - Cashier Register", "type": "camera", "x": 75, "y": 65, "rotation": 210, "details": "High-speed 1080p counter security camera with varifocal lens"},
            {"id": "m3", "label": "Suspect Breach Point", "type": "suspect_entry", "x": 18, "y": 28, "rotation": 90, "details": "Suspect entered rapidly through sliding glass doors at 22:13:58"},
            {"id": "m4", "label": "Cash Counter & Register", "type": "point_of_interest", "x": 70, "y": 70, "rotation": 0, "details": "Confrontation locus: Cashier held at gunpoint, drawer opened"},
            {"id": "m5", "label": "Ceiling Display (Bullet Hole)", "type": "weapon_drop", "x": 62, "y": 55, "rotation": 0, "details": "Impact crater: 9mm projectile lodged in acoustic tile header"},
            {"id": "m6", "label": "Suspect Escape Vector", "type": "escape_route", "x": 10, "y": 15, "rotation": 315, "details": "Suspect sprinted northwest into unlit service alleyway"}
        ],
        "timeline": [
            {
                "id": "t1",
                "timestamp": "22:13:58",
                "time_seconds": 0,
                "modality": "visual",
                "severity": "warning",
                "title": "Perimeter Breach: Suspect Enters Store",
                "description": "Suspect wearing dark hoodie, balaclava, and black gloves enters through main north sliding entrance. Pushes left door panel forcefully.",
                "evidence_id": "E-01",
                "confidence": 0.98,
                "tags": ["Person Detected", "Concealed Face", "Gloves"]
            },
            {
                "id": "t2",
                "timestamp": "22:14:08",
                "time_seconds": 10,
                "modality": "visual",
                "severity": "warning",
                "title": "Approach & Threat Posture",
                "description": "Suspect reaches counter perimeter with right hand inside jacket pocket. Cashier turns toward suspect.",
                "evidence_id": "E-01",
                "confidence": 0.96,
                "tags": ["Pre-attack Indicator", "Suspicious Movement"]
            },
            {
                "id": "t3",
                "timestamp": "22:14:15",
                "time_seconds": 17,
                "modality": "visual",
                "severity": "critical",
                "title": "Weapon Brandished: Handgun Identified",
                "description": "Suspect draws semi-automatic handgun (classified: Glock 19 9mm, confidence 97.4%). Aims weapon directly at clerk's torso.",
                "evidence_id": "E-02",
                "confidence": 0.97,
                "tags": ["Firearm Detected", "Glock 19", "Lethal Threat"]
            },
            {
                "id": "t4",
                "timestamp": "22:14:25",
                "time_seconds": 27,
                "modality": "visual",
                "severity": "warning",
                "title": "Register Drawers Opened",
                "description": "Clerk places hands above head, steps backward, and keys open the primary cash drawer. Suspect slides black nylon duffle bag forward.",
                "evidence_id": "E-02",
                "confidence": 0.94,
                "tags": ["Cash Seizure", "Subdued Victim"]
            },
            {
                "id": "t5",
                "timestamp": "22:14:38",
                "time_seconds": 40,
                "modality": "hybrid",
                "severity": "critical",
                "title": "Firearm Discharge (Muzzle Blast & Audio Spike)",
                "description": "Visual recoil observed on Cam-02. Acoustic impulse spike detected on microphone: 138.4 dB peak at 2.4 kHz. Projectile penetrates ceiling display panel.",
                "evidence_id": "E-02",
                "confidence": 0.99,
                "tags": ["Gunshot Acoustic Event", "Supersonic Shockwave", "Ballistic Discharge"]
            },
            {
                "id": "t6",
                "timestamp": "22:14:55",
                "time_seconds": 57,
                "modality": "visual",
                "severity": "warning",
                "title": "Currency Seized into Duffle Bag",
                "description": "Suspect grabs approximately $2,800 cash notes from register tray with gloved left hand. Leaves register tray ajar.",
                "evidence_id": "E-02",
                "confidence": 0.95,
                "tags": ["Theft Completed", "Physical Evidence Opportunity"]
            },
            {
                "id": "t7",
                "timestamp": "22:15:04",
                "time_seconds": 66,
                "modality": "visual",
                "severity": "warning",
                "title": "Suspect Flight through North Threshold",
                "description": "Suspect sprints past front door sensors, turning hard left toward Grand Ave north service alley.",
                "evidence_id": "E-01",
                "confidence": 0.97,
                "tags": ["Flight Vector", "Alleyway Egress"]
            },
            {
                "id": "t8",
                "timestamp": "22:15:22",
                "time_seconds": 84,
                "modality": "audio",
                "severity": "info",
                "title": "Emergency 911 Dispatch Call Initiated",
                "description": "Store cashier presses emergency silent latch and dials 911 via landline handset. Voice stress analysis records 88% vocal tension.",
                "evidence_id": "E-03",
                "confidence": 0.98,
                "tags": ["911 Audio", "High Vocal Stress", "Clerk Statement"]
            }
        ],
        "evidence": [
            {
                "id": "E-01",
                "type": "image",
                "title": "CCTV Cam-01: North Entrance Breach",
                "filename": "cctv_entrance_breach.jpg",
                "file_url": "/api/static/cctv_entrance_breach.jpg",
                "source": "Storefront Cam-01 (IP: 192.168.1.101)",
                "timestamp": "2026-10-24 22:13:58",
                "sha256": "4b8f72a1e9c80d44b93198031d9b32e185c7fa3b1d09e5e7fa918b2c4e612019",
                "width": 1920,
                "height": 1080,
                "forensic_notes": "Optical clarity 91%. Suspect height calculated at 182cm ± 3cm based on door frame reference markers. Hood fully obscuring hair; balaclava covers lower facial geometry.",
                "metadata": {
                    "Resolution": "1920x1080 @ 30 FPS",
                    "Sensor": "Sony Starvis IMX327 Low-Light CMOS",
                    "Focal Length": "3.6mm Fixed",
                    "ISO": "1600",
                    "Shutter": "1/120 sec"
                },
                "detections": [
                    {
                        "id": "det-101",
                        "label": "Suspect (Person)",
                        "category": "person",
                        "confidence": 0.984,
                        "description": "Male adult silhouette, approx 6'0\", medium build. Wearing dark charcoal hooded sweatshirt, black combat trousers.",
                        "flags": ["Masked", "Gloved", "Rapid Kinetic Movement"],
                        "bbox": {
                            "x": 28.5,
                            "y": 18.2,
                            "w": 38.0,
                            "h": 72.5,
                            "label": "SUSPECT #1 [98.4%]",
                            "confidence": 0.984,
                            "category": "person",
                            "color": "#00e5ff"
                        }
                    },
                    {
                        "id": "det-102",
                        "label": "Concealed Firearm Hold",
                        "category": "weapon",
                        "confidence": 0.932,
                        "description": "Right hand placed firmly inside kangaroo pocket in unnatural rigid posture consistent with concealed firearm grip.",
                        "flags": ["Concealed Weapon Indicator"],
                        "bbox": {
                            "x": 42.0,
                            "y": 50.0,
                            "w": 16.5,
                            "h": 18.0,
                            "label": "CONCEALED WEAPON INDICATOR [93.2%]",
                            "confidence": 0.932,
                            "category": "weapon",
                            "color": "#ff3366"
                        }
                    },
                    {
                        "id": "det-103",
                        "label": "Black Tactical Duffle",
                        "category": "object",
                        "confidence": 0.915,
                        "description": "Heavy cordura nylon duffle bag slung over left shoulder, unzipped top aperture ready for cash transfer.",
                        "flags": ["Premeditation Item"],
                        "bbox": {
                            "x": 30.0,
                            "y": 48.0,
                            "w": 15.0,
                            "h": 26.0,
                            "label": "CONTRABAND BAG [91.5%]",
                            "confidence": 0.915,
                            "category": "object",
                            "color": "#ffb300"
                        }
                    }
                ]
            },
            {
                "id": "E-02",
                "type": "image",
                "title": "CCTV Cam-02: Cashier Counter Weapon Brandishment",
                "filename": "cctv_counter_brandish.jpg",
                "file_url": "/api/static/cctv_counter_brandish.jpg",
                "source": "Counter Security Cam-02 (IP: 192.168.1.102)",
                "timestamp": "2026-10-24 22:14:18",
                "sha256": "9a3e218c541b6c70281b9e8432a76f5d81b994821a73f8e5c102b489a2e6f110",
                "width": 1920,
                "height": 1080,
                "forensic_notes": "Direct line of sight to weapon action. Slide geometry, trigger guard contour, and ejection port position strongly match Glock 19 Gen 5. Projectile trajectory angle measured at +32° elevation toward north ceiling panel.",
                "metadata": {
                    "Resolution": "1920x1080 @ 60 FPS",
                    "Sensor": "OmniVision OV4689 HDR",
                    "Focal Length": "6.0mm Telephoto",
                    "ISO": "800",
                    "Shutter": "1/250 sec"
                },
                "detections": [
                    {
                        "id": "det-201",
                        "label": "Semi-Automatic Firearm",
                        "category": "weapon",
                        "confidence": 0.974,
                        "description": "Glock-pattern polymer frame semi-automatic pistol. Black matte slide finish. Extended magazine baseplate visible.",
                        "flags": ["Lethal Weapon", "Finger on Trigger", "Active Threat"],
                        "bbox": {
                            "x": 48.0,
                            "y": 38.0,
                            "w": 22.0,
                            "h": 19.5,
                            "label": "WEAPON: GLOCK 19 9MM [97.4%]",
                            "confidence": 0.974,
                            "category": "weapon",
                            "color": "#ff3366"
                        }
                    },
                    {
                        "id": "det-202",
                        "label": "Victim (Store Cashier)",
                        "category": "person",
                        "confidence": 0.988,
                        "description": "Store employee in green apron, hands fully elevated above shoulders in defensive surrender posture.",
                        "flags": ["Victim", "Hands Elevated", "Coercion"],
                        "bbox": {
                            "x": 72.0,
                            "y": 24.0,
                            "w": 24.0,
                            "h": 68.0,
                            "label": "VICTIM (CLERK) [98.8%]",
                            "confidence": 0.988,
                            "category": "person",
                            "color": "#00e676"
                        }
                    },
                    {
                        "id": "det-203",
                        "label": "Cash Register Primary Drawer",
                        "category": "object",
                        "confidence": 0.952,
                        "description": "NCR RealPOS motorized cash drawer fully extended. Compartments for $20 and $100 bills disturbed.",
                        "flags": ["Theft Locus", "Latent Print Surface"],
                        "bbox": {
                            "x": 38.0,
                            "y": 62.0,
                            "w": 34.0,
                            "h": 28.0,
                            "label": "CASH REGISTER [95.2%]",
                            "confidence": 0.952,
                            "category": "object",
                            "color": "#ffb300"
                        }
                    }
                ]
            },
            {
                "id": "E-03",
                "type": "audio",
                "title": "Emergency 911 Call Audio & Surveillance Mic Fusion",
                "filename": "911_dispatch_call_CV0892.wav",
                "file_url": "/api/static/911_dispatch_call_CV0892.wav",
                "source": "Central 911 CAD Logging Trunk #9 + In-store ambient mic",
                "timestamp": "2026-10-24 22:15:22",
                "sha256": "3e712a884f0920d3a54b98c3e8027a41983e2bb78502f9e4210a9c8b74f33190",
                "duration_sec": 72.0,
                "forensic_notes": "Synchronized dual-channel analysis: Channel A provides clerk emergency telephone statement. Channel B (background surveillance audio) captures preceding muzzle blast at -44 seconds relative to call connection.",
                "metadata": {
                    "Format": "PCM 16-bit 44.1 kHz Mono",
                    "SNR": "26.4 dB",
                    "Vocal Pitch Variance": "High (Panic Signature)"
                },
                "waveform": [
                    12, 14, 18, 15, 20, 22, 19, 14, 12, 18, 25, 30, 22, 18, 15, 
                    14, 16, 20, 28, 35, 42, 60, 85, 98, 92, 70, 45, 30, 22, 18,
                    24, 38, 55, 62, 75, 80, 88, 82, 65, 52, 44, 35, 28, 22, 19,
                    25, 42, 68, 79, 85, 90, 84, 72, 60, 48, 38, 26, 20, 16, 14,
                    22, 35, 48, 54, 60, 52, 40, 32, 24, 18, 15, 12
                ],
                "acoustic_events": [
                    {
                        "id": "ac-01",
                        "timestamp_sec": 23.4,
                        "time_formatted": "00:23",
                        "event_type": "Gunshot Discharge (Impulse)",
                        "confidence": 0.985,
                        "decibels": 138.4,
                        "frequency_band": "2.4 kHz Muzzle Blast Peak",
                        "description": "Instantaneous acoustic shockwave followed by 0.42s reverberation decay. Conclusive gunshot signature matching indoor firearm discharge."
                    },
                    {
                        "id": "ac-02",
                        "timestamp_sec": 38.1,
                        "time_formatted": "00:38",
                        "event_type": "Vocal Distress / Panic Spike",
                        "confidence": 0.942,
                        "decibels": 84.2,
                        "frequency_band": "850 Hz Formant Shift",
                        "description": "Fundamental vocal frequency jumped from 140 Hz to 285 Hz, indicating acute psychological terror and involuntary adrenaline response."
                    },
                    {
                        "id": "ac-03",
                        "timestamp_sec": 58.7,
                        "time_formatted": "00:58",
                        "event_type": "Rapid Footsteps & Door Slam",
                        "confidence": 0.891,
                        "decibels": 76.5,
                        "frequency_band": "Low-frequency impact 80-200 Hz",
                        "description": "Rhythmic acceleration consistent with adult male sprint across linoleum flooring toward exterior exit."
                    }
                ],
                "transcript": [
                    {
                        "id": "tr-01",
                        "start": 0.0,
                        "end": 4.5,
                        "speaker": "911 Dispatcher",
                        "text": "911 Emergency. Where is your emergency?",
                        "confidence": 0.99,
                        "stress_level": 0.05,
                        "acoustic_tags": ["Calm", "Operational"]
                    },
                    {
                        "id": "tr-02",
                        "start": 4.8,
                        "end": 14.2,
                        "speaker": "Store Clerk (Witness)",
                        "text": "Help! QuickMart on Grand Avenue! I just got held up at gunpoint! He had a gun, black handgun, pointed it right at my face!",
                        "confidence": 0.97,
                        "stress_level": 0.92,
                        "acoustic_tags": ["Extreme Agitation", "Hyperventilation"]
                    },
                    {
                        "id": "tr-03",
                        "start": 14.5,
                        "end": 20.0,
                        "speaker": "911 Dispatcher",
                        "text": "Units are being dispatched now. Is the suspect still on scene? Are you hurt?",
                        "confidence": 0.99,
                        "stress_level": 0.12,
                        "acoustic_tags": ["Triage", "Priority Code 1"]
                    },
                    {
                        "id": "tr-04",
                        "start": 20.3,
                        "end": 35.8,
                        "speaker": "Store Clerk (Witness)",
                        "text": "I'm not shot, but he fired one shot into the ceiling display! Loud as hell! He grabbed the cash from the register and took off running outside!",
                        "confidence": 0.96,
                        "stress_level": 0.88,
                        "acoustic_tags": ["Gunshot Confirmation", "Ceiling Impact Corroboration"]
                    },
                    {
                        "id": "tr-05",
                        "start": 36.2,
                        "end": 48.0,
                        "speaker": "911 Dispatcher",
                        "text": "Which direction did he run? Can you describe his clothing or vehicle?",
                        "confidence": 0.98,
                        "stress_level": 0.15,
                        "acoustic_tags": ["Tactical Query"]
                    },
                    {
                        "id": "tr-06",
                        "start": 48.4,
                        "end": 68.0,
                        "speaker": "Store Clerk (Witness)",
                        "text": "He went left toward the north alley! Dark hoodie, black ski mask, black gloves, carrying a dark gym bag. Left-handed! He was holding the gun in his left hand when he pointed it!",
                        "confidence": 0.95,
                        "stress_level": 0.79,
                        "acoustic_tags": ["Left-Handed Corroboration", "Clothing Description"]
                    }
                ]
            }
        ]
    },
    "CV-2026-1140": {
        "id": "CV-2026-1140",
        "case_number": "CR-2026-1140-PORT",
        "title": "Industrial Wharf Perimeter Breach & Contraband Transfer",
        "status": "Active Investigation",
        "jurisdiction": "Port Authority & Federal Maritime Task Force",
        "lead_investigator": "Special Agent Elena Rostova (Badge #792)",
        "incident_date": "2026-10-22 02:41:10 EST",
        "incident_location": "Pier 14, Berth 9 South Waterfront Cargo Terminal",
        "threat_level": "High",
        "summary": "Unregistered stealth rigid-inflatable boat (RIB) docked without navigation beacons at Berth 9. Three masked infiltrators used an oxy-acetylene torch to breach container #MSKU-892110 containing sensitive electronics and controlled precursors. Hydrophone and FLIR thermal analytics fused with perimeter ultrasonic sensor.",
        "chain_of_custody": [
            {"date": "2026-10-22 03:15", "officer": "Port Security Sgt. D. Gomez", "action": "Perimeter infrared DVR logs locked and extracted."},
            {"date": "2026-10-22 04:00", "officer": "SA E. Rostova", "action": "Acoustic underwater sensor hydrophone telemetry synced."}
        ],
        "forensic_hypotheses": [
            "Infiltrators operated with inside manifests knowing container #MSKU-892110 exact coordinate.",
            "Thermal signature shows rapid industrial cutting torch usage (flame temperature estimated > 2800°C).",
            "Vessel departed at 42 knots southward toward international waters within 4 minutes."
        ],
        "scene_markers": [
            {"id": "m1", "label": "FLIR Thermal Cam-4", "type": "camera", "x": 20, "y": 30, "rotation": 60, "details": "Long-wave infrared FLIR camera covering Berth 9"},
            {"id": "m2", "label": "Berth 9 Tie-up Cleat", "type": "point_of_interest", "x": 60, "y": 20, "rotation": 0, "details": "Boat docking contact point, rubber rub-rail residue left"},
            {"id": "m3", "label": "Container #MSKU-892110", "type": "evidence", "x": 55, "y": 65, "rotation": 0, "details": "Thermal breach point: Cut padlock and hinge seals"},
            {"id": "m4", "label": "Escape Waterway", "type": "escape_route", "x": 85, "y": 15, "rotation": 45, "details": "High-speed water egress route south toward shipping channel"}
        ],
        "timeline": [
            {
                "id": "t1",
                "timestamp": "02:40:45",
                "time_seconds": 0,
                "modality": "audio",
                "severity": "warning",
                "title": "Subsurface Hydrophone Anomaly",
                "description": "Twin outboard Yamaha engine cavitation detected 200m off Berth 9 without AIS transponder broadcasting.",
                "evidence_id": "E-02",
                "confidence": 0.94,
                "tags": ["Acoustic Sonar", "Unregistered Vessel"]
            },
            {
                "id": "t2",
                "timestamp": "02:41:10",
                "time_seconds": 25,
                "modality": "visual",
                "severity": "critical",
                "title": "Thermal Cam Detects 3 Infiltrators",
                "description": "FLIR thermal camera logs 3 human heat signatures leaping onto pier decking from black RIB craft.",
                "evidence_id": "E-01",
                "confidence": 0.97,
                "tags": ["Thermal Tracking", "Multiple Infiltrators"]
            },
            {
                "id": "t3",
                "timestamp": "02:41:52",
                "time_seconds": 67,
                "modality": "visual",
                "severity": "critical",
                "title": "Industrial Cutting Torch Thermal Bloom",
                "description": "Intense white-hot thermal bloom (>2500°C) observed at container lock bracket. Padlock melted in 18 seconds.",
                "evidence_id": "E-01",
                "confidence": 0.99,
                "tags": ["Cutting Torch", "Thermal Signature", "Forced Entry"]
            },
            {
                "id": "t4",
                "timestamp": "02:43:10",
                "time_seconds": 145,
                "modality": "visual",
                "severity": "warning",
                "title": "Pelican Cases Transferred",
                "description": "Two heavy Pelican waterproof transit cases carried from container interior onto RIB vessel deck.",
                "evidence_id": "E-01",
                "confidence": 0.93,
                "tags": ["Cargo Transfer", "Contraband"]
            }
        ],
        "evidence": [
            {
                "id": "E-01",
                "type": "image",
                "title": "FLIR Thermal Cam-4: Berth 9 Container Breach",
                "filename": "flir_pier_breach.jpg",
                "file_url": "/api/static/flir_pier_breach.jpg",
                "source": "FLIR PTZ-12 Thermal Imaging System",
                "timestamp": "2026-10-22 02:41:52",
                "sha256": "771b9c8e23401fa940e72b4c102938475a1c0d8b7625140e982134567890abcd",
                "width": 1280,
                "height": 720,
                "forensic_notes": "Radiometric thermal image. Color-scale calibrated: yellow/white indicates extreme thermal radiation. Clear heat blooms on hands and tool nozzle.",
                "metadata": {
                    "Sensor": "Uncooled VOx Microbolometer 640x512",
                    "Spectral Range": "7.5 - 14 um",
                    "Thermal Sensitivity": "<30 mK"
                },
                "detections": [
                    {
                        "id": "det-301",
                        "label": "Thermal Cutter Torch Bloom",
                        "category": "weapon",
                        "confidence": 0.992,
                        "description": "Extreme concentrated heat plume (approx 2,800°C) focused directly on hardened steel container lock bracket.",
                        "flags": ["Thermal Breach", "Industrial Tool"],
                        "bbox": {
                            "x": 52.0,
                            "y": 42.0,
                            "w": 14.0,
                            "h": 16.0,
                            "label": "THERMAL CUTTER BLOOM [99.2%]",
                            "confidence": 0.992,
                            "category": "weapon",
                            "color": "#ff3366"
                        }
                    },
                    {
                        "id": "det-302",
                        "label": "Infiltrator Alpha (Lead Operator)",
                        "category": "person",
                        "confidence": 0.965,
                        "description": "Subject in thermal wetsuit with heat dissipation gear, holding torch wand.",
                        "flags": ["Suspect", "Thermal Masking"],
                        "bbox": {
                            "x": 38.0,
                            "y": 28.0,
                            "w": 22.0,
                            "h": 62.0,
                            "label": "INFILTRATOR ALPHA [96.5%]",
                            "confidence": 0.965,
                            "category": "person",
                            "color": "#00e5ff"
                        }
                    },
                    {
                        "id": "det-303",
                        "label": "Pelican Hardcase #01",
                        "category": "object",
                        "confidence": 0.938,
                        "description": "Reinforced mil-spec transport case on ground awaiting loading.",
                        "flags": ["Contraband Transit"],
                        "bbox": {
                            "x": 22.0,
                            "y": 68.0,
                            "w": 18.0,
                            "h": 19.0,
                            "label": "CARGO CASE [93.8%]",
                            "confidence": 0.938,
                            "category": "object",
                            "color": "#ffb300"
                        }
                    }
                ]
            },
            {
                "id": "E-02",
                "type": "audio",
                "title": "Perimeter Acoustic Sensor & Hydrophone Telemetry",
                "filename": "hydrophone_wharf_0241.wav",
                "file_url": "/api/static/hydrophone_wharf_0241.wav",
                "source": "Terminal South Hydrophone Sensor H-3",
                "timestamp": "2026-10-22 02:40:45",
                "sha256": "192837465abcde1234567890f0e1d2c3b4a596870a1b2c3d4e5f6a7b8c9d0e1f",
                "duration_sec": 60.0,
                "forensic_notes": "Acoustic signature shows low-frequency twin hull harmonics followed by high-frequency thermal hissing as molten metal dropped into harbor water.",
                "metadata": {
                    "Sensor": "Teledyne RESON Hydrophone TC4032",
                    "Frequency Response": "10 Hz to 80 kHz"
                },
                "waveform": [
                    15, 18, 22, 28, 35, 42, 50, 44, 38, 30, 25, 20, 18, 22, 26,
                    30, 36, 45, 58, 72, 85, 94, 90, 80, 68, 55, 45, 38, 32, 28,
                    25, 30, 38, 48, 62, 75, 88, 92, 86, 74, 62, 50, 40, 32, 25,
                    20, 22, 28, 35, 44, 52, 60, 50, 42, 34, 28, 22, 18, 15, 12
                ],
                "acoustic_events": [
                    {
                        "id": "ac-201",
                        "timestamp_sec": 12.8,
                        "time_formatted": "00:12",
                        "event_type": "High-Speed Outboard Cavitation",
                        "confidence": 0.961,
                        "decibels": 92.4,
                        "frequency_band": "120-400 Hz Marine Acoustic",
                        "description": "Twin four-stroke outboard propeller blade cavitation consistent with military-grade RIB craft."
                    },
                    {
                        "id": "ac-202",
                        "timestamp_sec": 34.5,
                        "time_formatted": "00:34",
                        "event_type": "Molten Slag Quench in Water",
                        "confidence": 0.924,
                        "decibels": 74.8,
                        "frequency_band": "5 kHz - 12 kHz Hissing Transients",
                        "description": "Rapid thermal steam expansion created by molten steel droplets plunging into seawater."
                    }
                ],
                "transcript": [
                    {
                        "id": "tr-201",
                        "start": 0.0,
                        "end": 8.0,
                        "speaker": "Port Security Guard",
                        "text": "Control, this is Post 4. I'm hearing engine noise down near Berth 9. There are no scheduled dockings until 0600.",
                        "confidence": 0.98,
                        "stress_level": 0.25,
                        "acoustic_tags": ["Radio Dispatch"]
                    },
                    {
                        "id": "tr-202",
                        "start": 8.5,
                        "end": 18.0,
                        "speaker": "Port Security Dispatch",
                        "text": "Copy Post 4. Checking radar. Radar shows no beacon... wait, Thermal Camera 4 just triggered an unverified motion alarm on container row B.",
                        "confidence": 0.97,
                        "stress_level": 0.40,
                        "acoustic_tags": ["Alarm Corroboration"]
                    }
                ]
            }
        ]
    },
    "CV-2026-0417": {
        "id": "CV-2026-0417",
        "case_number": "CR-2026-0417-TRANSIT",
        "title": "Central Transit Station Mezzanine Aggravated Assault",
        "status": "Active Investigation",
        "jurisdiction": "Transit Police Forensic Services",
        "lead_investigator": "Detective Sarah Sterling (Badge #210)",
        "incident_date": "2026-10-18 17:42:15 EST",
        "incident_location": "Central Metro Station, Concourse Level Escalator 3",
        "threat_level": "High",
        "summary": "Rush-hour altercation on Concourse Level Escalator 3. Suspect produced a concealed folding tactical blade, slashed victim across left forearm, and fled through emergency exit turnstile #4 into the commuter crowd. Mobile bystander audio captures clear verbal threats.",
        "chain_of_custody": [
            {"date": "2026-10-18 18:05", "officer": "Transit Ofc. K. Patel", "action": "Station 4K PTZ dome footage secured."},
            {"date": "2026-10-18 18:30", "officer": "Det. S. Sterling", "action": "Witness smartphone recording ingested with EXIF validation."}
        ],
        "forensic_hypotheses": [
            "Confrontation was preceded by brief verbal exchange on platform 2.",
            "Weapon identified as a 3.5-inch black tanto-point folding tactical knife.",
            "Suspect transit card tap occurred at 17:34:02 at Uptown Station, giving potential identity track."
        ],
        "scene_markers": [
            {"id": "m1", "label": "4K Dome PTZ Cam-14", "type": "camera", "x": 35, "y": 25, "rotation": 120, "details": "Axis 4K UHD PTZ tracking escalator 3 descent"},
            {"id": "m2", "label": "Escalator 3 Contact Zone", "type": "point_of_interest", "x": 50, "y": 50, "rotation": 0, "details": "Physical altercation locus, blood droplet trail marked"},
            {"id": "m3", "label": "Turnstile Emergency Gate 4", "type": "escape_route", "x": 80, "y": 75, "rotation": 90, "details": "Suspect forced push bar and bolted into subway plaza"}
        ],
        "timeline": [
            {
                "id": "t1",
                "timestamp": "17:42:01",
                "time_seconds": 0,
                "modality": "visual",
                "severity": "info",
                "title": "Suspect & Victim Descend Escalator",
                "description": "Suspect wearing red beanie and leather jacket walks briskly down escalator behind victim.",
                "evidence_id": "E-01",
                "confidence": 0.98,
                "tags": ["Person Tracking", "Rush Hour Surveillance"]
            },
            {
                "id": "t2",
                "timestamp": "17:42:15",
                "time_seconds": 14,
                "modality": "visual",
                "severity": "critical",
                "title": "Edged Weapon Brandished",
                "description": "Suspect draws folding tactical knife with rapid thumb stud deployment. Blade locks open.",
                "evidence_id": "E-01",
                "confidence": 0.96,
                "tags": ["Edged Weapon", "Tactical Knife", "Imminent Assault"]
            },
            {
                "id": "t3",
                "timestamp": "17:42:24",
                "time_seconds": 23,
                "modality": "hybrid",
                "severity": "critical",
                "title": "Physical Altercation & Crowd Scream",
                "description": "Victim turns defensively, sustaining slashing injury. Bystanders scream; audio spike detected at 96 dB.",
                "evidence_id": "E-02",
                "confidence": 0.99,
                "tags": ["Assault", "Acoustic Panic", "Injury Inflicted"]
            }
        ],
        "evidence": [
            {
                "id": "E-01",
                "type": "image",
                "title": "PTZ Cam-14: Escalator Mezzanine Assault",
                "filename": "transit_escalator_assault.jpg",
                "file_url": "/api/static/transit_escalator_assault.jpg",
                "source": "Concourse Axis 4K Cam-14",
                "timestamp": "2026-10-18 17:42:15",
                "sha256": "abcdef0123456789a1b2c3d4e5f67890123456789abcdef0123456789a1b2c3d",
                "width": 1920,
                "height": 1080,
                "forensic_notes": "Facial geometry score 0.82 despite partial shadow. Blade length measured at 3.5 inches against escalator handrail reference width.",
                "metadata": {
                    "Resolution": "3840x2160 Downscaled 1080p",
                    "Lighting": "Fluorescent Mezzanine 450 Lux"
                },
                "detections": [
                    {
                        "id": "det-401",
                        "label": "Folding Tactical Knife",
                        "category": "weapon",
                        "confidence": 0.958,
                        "description": "Black oxide coated tanto blade folding knife, approx 3.5 inch cutting edge.",
                        "flags": ["Edged Weapon", "Active Assault"],
                        "bbox": {
                            "x": 46.0,
                            "y": 44.0,
                            "w": 15.0,
                            "h": 14.0,
                            "label": "WEAPON: TACTICAL BLADE [95.8%]",
                            "confidence": 0.958,
                            "category": "weapon",
                            "color": "#ff3366"
                        }
                    },
                    {
                        "id": "det-402",
                        "label": "Suspect (Red Beanie)",
                        "category": "person",
                        "confidence": 0.981,
                        "description": "Male adult, late 20s, red knit beanie, dark brown leather bomber jacket.",
                        "flags": ["Suspect", "Aggressor"],
                        "bbox": {
                            "x": 36.0,
                            "y": 20.0,
                            "w": 25.0,
                            "h": 70.0,
                            "label": "SUSPECT (AGGRESSOR) [98.1%]",
                            "confidence": 0.981,
                            "category": "person",
                            "color": "#00e5ff"
                        }
                    }
                ]
            },
            {
                "id": "E-02",
                "type": "audio",
                "title": "Bystander Mobile Recording Audio",
                "filename": "witness_transit_audio.wav",
                "file_url": "/api/static/witness_transit_audio.wav",
                "source": "Witness iPhone 15 Pro Audio Memo",
                "timestamp": "2026-10-18 17:42:10",
                "sha256": "ffeeddccbbaa99887766554433221100ffeeddccbbaa99887766554433221100",
                "duration_sec": 45.0,
                "forensic_notes": "High clarity directional microphone capture. Clear voice recording of suspect threatening victim immediately before the slash.",
                "metadata": {
                    "Sample Rate": "48.0 kHz Stereo",
                    "Codec": "AAC High Efficiency"
                },
                "waveform": [
                    10, 12, 14, 18, 22, 28, 35, 42, 58, 70, 84, 95, 99, 90, 78,
                    65, 52, 40, 35, 30, 28, 32, 40, 52, 65, 80, 88, 92, 85, 70,
                    55, 45, 35, 28, 22, 18, 15, 14, 12, 10
                ],
                "acoustic_events": [
                    {
                        "id": "ac-401",
                        "timestamp_sec": 14.2,
                        "time_formatted": "00:14",
                        "event_type": "Commuter Crowd Panic Spike",
                        "confidence": 0.952,
                        "decibels": 96.5,
                        "frequency_band": "1.2 kHz - 3.5 kHz Vocal Shrill",
                        "description": "Multi-individual screaming event in tiled underground acoustic reverberation space."
                    }
                ],
                "transcript": [
                    {
                        "id": "tr-401",
                        "start": 0.0,
                        "end": 6.2,
                        "speaker": "Suspect",
                        "text": "Don't you ever look at me like that again! Step back or I'll carve you up!",
                        "confidence": 0.96,
                        "stress_level": 0.85,
                        "acoustic_tags": ["Verbal Threat", "Hostile Pitch"]
                    },
                    {
                        "id": "tr-402",
                        "start": 6.8,
                        "end": 12.0,
                        "speaker": "Victim",
                        "text": "Back off man! What's wrong with you?! Put that away!",
                        "confidence": 0.94,
                        "stress_level": 0.90,
                        "acoustic_tags": ["Defensive Plea"]
                    },
                    {
                        "id": "tr-403",
                        "start": 12.5,
                        "end": 20.0,
                        "speaker": "Bystander Screams",
                        "text": "[High-pitched screams] He's got a knife! Security! Somebody call police!",
                        "confidence": 0.92,
                        "stress_level": 0.98,
                        "acoustic_tags": ["Crowd Alarm", "Evacuation"]
                    }
                ]
            }
        ]
    }
}

def get_all_cases() -> List[Dict]:
    """Returns summaries of all preloaded cases."""
    summaries = []
    for c_id, case in PRELOADED_CASES.items():
        summaries.append({
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
            "evidence_count": len(case["evidence"]),
            "timeline_count": len(case["timeline"])
        })
    return summaries

def get_case_by_id(case_id: str) -> Dict:
    """Returns full case data including all evidence and timeline."""
    if case_id in PRELOADED_CASES:
        return copy.deepcopy(PRELOADED_CASES[case_id])
    return None
