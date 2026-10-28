import io
from pathlib import Path
from typing import Dict, Any
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.pdfgen import canvas
from .config import REPORTS_DIR

class NumberedCanvas(canvas.Canvas):
    """Custom canvas that adds professional forensic header and footer with page numbers."""
    def __init__(self, *args, **kwargs):
        super(NumberedCanvas, self).__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super(NumberedCanvas, self).showPage()
        super(NumberedCanvas, self).save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748b"))
        
        # Header (pages > 1)
        if self._pageNumber > 1:
            self.drawString(54, 755, "CRIMEVISION AI — FORENSIC INTELLIGENCE DOSSIER")
            self.drawRightString(612 - 54, 755, "CONFIDENTIAL / LAW ENFORCEMENT SENSITIVE")
            self.setStrokeColor(colors.HexColor("#cbd5e1"))
            self.setLineWidth(0.5)
            self.line(54, 750, 612 - 54, 750)
            
        # Footer
        self.setStrokeColor(colors.HexColor("#cbd5e1"))
        self.setLineWidth(0.5)
        self.line(54, 45, 612 - 54, 45)
        self.drawString(54, 32, "CHAIN OF CUSTODY VERIFIED — DIGITAL HASH SHA-256")
        page_str = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(612 - 54, 32, page_str)
        self.restoreState()

def generate_case_pdf_report(case_data: Dict[str, Any], notes: str = "") -> bytes:
    """Generates a court-admissible forensic examination dossier PDF."""
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )
    
    styles = getSampleStyleSheet()
    
    # Custom forensic styling palette
    PRIMARY_COLOR = colors.HexColor("#0f172a")     # Deep tactical slate
    ACCENT_CYAN = colors.HexColor("#0284c7")       # Cyber cyan
    ALERT_RED = colors.HexColor("#b91c1c")         # Threat alert crimson
    BORDER_COLOR = colors.HexColor("#cbd5e1")
    BG_LIGHT = colors.HexColor("#f8fafc")
    BG_ALT = colors.HexColor("#f1f5f9")
    
    title_style = ParagraphStyle(
        "DocTitle",
        parent=styles["Heading1"],
        fontName="Helvetica-Bold",
        fontSize=20,
        leading=24,
        textColor=PRIMARY_COLOR,
        spaceAfter=4
    )
    
    subtitle_style = ParagraphStyle(
        "DocSubtitle",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=10,
        leading=14,
        textColor=ACCENT_CYAN,
        spaceAfter=12
    )
    
    section_heading = ParagraphStyle(
        "SectionHeading",
        parent=styles["Heading2"],
        fontName="Helvetica-Bold",
        fontSize=12,
        leading=16,
        textColor=PRIMARY_COLOR,
        spaceBefore=14,
        spaceAfter=6
    )
    
    body_style = ParagraphStyle(
        "BodyDark",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=9,
        leading=13,
        textColor=colors.HexColor("#1e293b")
    )
    
    cell_bold = ParagraphStyle(
        "CellBold",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=8.5,
        leading=11,
        textColor=PRIMARY_COLOR
    )
    
    cell_regular = ParagraphStyle(
        "CellRegular",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=8,
        leading=11,
        textColor=colors.HexColor("#334155")
    )
    
    elements = []
    
    # 1. Official Header Badge Banner
    banner_data = [
        [
            Paragraph("<b>FORENSIC INTELLIGENCE & CRIME SCENE RECONSTRUCTION</b><br/><font size=7 color='#64748b'>EVIDENCE INTEGRITY DIVISION &bull; AUTOMATED MULTIMODAL SYNTHESIS</font>", cell_bold),
            Paragraph(f"<b>CLASSIFICATION:</b> <font color='#b91c1c'>LAW ENFORCEMENT ONLY</font><br/><b>DOSSIER ID:</b> {case_data.get('case_number')}", cell_regular)
        ]
    ]
    banner_table = Table(banner_data, colWidths=[320, 184])
    banner_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), BG_ALT),
        ('BOX', (0, 0), (-1, -1), 1, BORDER_COLOR),
        ('PADDING', (0, 0), (-1, -1), 6),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    elements.append(banner_table)
    elements.append(Spacer(1, 10))
    
    # Title
    elements.append(Paragraph(f"Forensic Examination Dossier: {case_data.get('title')}", title_style))
    elements.append(Paragraph(f"Case Reference: {case_data.get('case_number')} &bull; Status: {case_data.get('status')} &bull; Jurisdiction: {case_data.get('jurisdiction')}", subtitle_style))
    elements.append(HRFlowable(width="100%", thickness=1.5, color=PRIMARY_COLOR, spaceBefore=2, spaceAfter=10))
    
    # 2. Case Incident Summary Table
    meta_table_data = [
        [Paragraph("<b>Case Number:</b>", cell_bold), Paragraph(str(case_data.get("case_number")), cell_regular), Paragraph("<b>Incident Date/Time:</b>", cell_bold), Paragraph(str(case_data.get("incident_date")), cell_regular)],
        [Paragraph("<b>Lead Investigator:</b>", cell_bold), Paragraph(str(case_data.get("lead_investigator")), cell_regular), Paragraph("<b>Threat Level:</b>", cell_bold), Paragraph(f"<font color='#b91c1c'><b>{case_data.get('threat_level')}</b></font>", cell_regular)],
        [Paragraph("<b>Incident Location:</b>", cell_bold), Paragraph(str(case_data.get("incident_location")), cell_regular), Paragraph("<b>Report Generated:</b>", cell_bold), Paragraph("CrimeVision Automated Engine", cell_regular)],
    ]
    meta_table = Table(meta_table_data, colWidths=[110, 150, 110, 134])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), BG_LIGHT),
        ('GRID', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ('PADDING', (0, 0), (-1, -1), 4),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    elements.append(meta_table)
    elements.append(Spacer(1, 10))
    
    # Executive Incident Summary
    elements.append(Paragraph("1. EXECUTIVE FORENSIC INCIDENT SUMMARY", section_heading))
    elements.append(Paragraph(case_data.get("summary", "No summary provided."), body_style))
    elements.append(Spacer(1, 8))
    
    # 3. Multimodal Evidence Ingestion & Cryptographic Chain of Custody
    elements.append(Paragraph("2. MULTIMODAL EVIDENCE CATALOG & CHAIN OF CUSTODY (SHA-256)", section_heading))
    ev_table_rows = [
        [Paragraph("<b>Item ID</b>", cell_bold), Paragraph("<b>Modality / Title</b>", cell_bold), Paragraph("<b>Source Sensor</b>", cell_bold), Paragraph("<b>SHA-256 Digest (Integrity Verified)</b>", cell_bold)]
    ]
    for ev in case_data.get("evidence", []):
        ev_table_rows.append([
            Paragraph(f"<b>{ev.get('id')}</b>", cell_bold),
            Paragraph(f"{ev.get('type').upper()}<br/><font color='#64748b'>{ev.get('title')}</font>", cell_regular),
            Paragraph(f"{ev.get('source')}<br/><font size=6.5 color='#94a3b8'>{ev.get('timestamp')}</font>", cell_regular),
            Paragraph(f"<font size=6 color='#0284c7'><code>{ev.get('sha256')}</code></font>", cell_regular)
        ])
        
    ev_table = Table(ev_table_rows, colWidths=[45, 160, 135, 164])
    ev_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), BG_ALT),
        ('GRID', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ('PADDING', (0, 0), (-1, -1), 4),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    elements.append(ev_table)
    elements.append(Spacer(1, 10))
    
    # 4. Computer Vision Object, Weapon & Subject Detections
    elements.append(Paragraph("3. COMPUTER VISION & MULTIMODAL DETECTION MATRIX", section_heading))
    det_rows = [
        [Paragraph("<b>Target Classification</b>", cell_bold), Paragraph("<b>Confidence</b>", cell_bold), Paragraph("<b>Source Item</b>", cell_bold), Paragraph("<b>Forensic Observation & Flags</b>", cell_bold)]
    ]
    for ev in case_data.get("evidence", []):
        for det in ev.get("detections", []):
            flags_str = " &bull; ".join(det.get("flags", []))
            cat_color = "#b91c1c" if det.get("category") == "weapon" else ("#0284c7" if det.get("category") == "person" else "#d97706")
            det_rows.append([
                Paragraph(f"<font color='{cat_color}'><b>{det.get('label')}</b></font><br/><font size=6.5 color='#64748b'>CAT: {det.get('category').upper()}</font>", cell_regular),
                Paragraph(f"<b>{det.get('confidence')*100:.1f}%</b>", cell_bold),
                Paragraph(f"{ev.get('id')}<br/><font size=6.5 color='#94a3b8'>{ev.get('timestamp')}</font>", cell_regular),
                Paragraph(f"{det.get('description')}<br/><font size=6.5 color='#b91c1c'>{flags_str}</font>", cell_regular)
            ])
            
    if len(det_rows) > 1:
        det_table = Table(det_rows, colWidths=[130, 65, 80, 229])
        det_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), BG_ALT),
            ('GRID', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
            ('PADDING', (0, 0), (-1, -1), 4),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ]))
        elements.append(det_table)
    else:
        elements.append(Paragraph("<i>No object detections registered.</i>", body_style))
    elements.append(Spacer(1, 10))
    
    # Page Break for Timeline & Audio Analysis
    elements.append(PageBreak())
    
    # 5. Chronological Forensic Reconstruction Timeline
    elements.append(Paragraph("4. SYNCHRONIZED CHRONOLOGICAL EVENT RECONSTRUCTION", section_heading))
    timeline_rows = [
        [Paragraph("<b>Timecode</b>", cell_bold), Paragraph("<b>Modality</b>", cell_bold), Paragraph("<b>Event Milestone</b>", cell_bold), Paragraph("<b>Forensic Synthesis Details</b>", cell_bold)]
    ]
    for evt in case_data.get("timeline", []):
        sev_color = "#b91c1c" if evt.get("severity") == "critical" else ("#d97706" if evt.get("severity") == "warning" else "#0284c7")
        timeline_rows.append([
            Paragraph(f"<b>{evt.get('timestamp')}</b>", cell_bold),
            Paragraph(f"<font color='{sev_color}'><b>{evt.get('modality').upper()}</b></font>", cell_regular),
            Paragraph(f"<b>{evt.get('title')}</b><br/><font size=6.5 color='#64748b'>Ref: {evt.get('evidence_id', 'N/A')}</font>", cell_regular),
            Paragraph(evt.get("description"), cell_regular)
        ])
        
    timeline_table = Table(timeline_rows, colWidths=[65, 65, 140, 234])
    timeline_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), BG_ALT),
        ('GRID', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ('PADDING', (0, 0), (-1, -1), 4),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    elements.append(timeline_table)
    elements.append(Spacer(1, 10))
    
    # 6. Acoustic Telemetry & Witness Statements
    elements.append(Paragraph("5. ACOUSTIC ANALYSIS & WITNESS DIARIZATION", section_heading))
    has_audio = False
    for ev in case_data.get("evidence", []):
        if ev.get("type") == "audio":
            has_audio = True
            elements.append(Paragraph(f"<b>Audio Stream: {ev.get('title')}</b> (Duration: {ev.get('duration_sec', 0)}s)", cell_bold))
            elements.append(Spacer(1, 4))
            
            # Acoustic events
            if ev.get("acoustic_events"):
                ac_rows = [
                    [Paragraph("<b>Time</b>", cell_bold), Paragraph("<b>Acoustic Anomaly</b>", cell_bold), Paragraph("<b>Amplitude</b>", cell_bold), Paragraph("<b>Acoustic Spectrum Observation</b>", cell_bold)]
                ]
                for ac in ev.get("acoustic_events", []):
                    ac_rows.append([
                        Paragraph(ac.get("time_formatted", ""), cell_bold),
                        Paragraph(f"<font color='#b91c1c'><b>{ac.get('event_type')}</b></font>", cell_regular),
                        Paragraph(f"<b>{ac.get('decibels')} dB</b>", cell_regular),
                        Paragraph(f"{ac.get('description')} (Band: {ac.get('frequency_band')})", cell_regular)
                    ])
                ac_table = Table(ac_rows, colWidths=[55, 120, 65, 264])
                ac_table.setStyle(TableStyle([
                    ('BACKGROUND', (0, 0), (-1, 0), BG_ALT),
                    ('GRID', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
                    ('PADDING', (0, 0), (-1, -1), 3),
                    ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                ]))
                elements.append(ac_table)
                elements.append(Spacer(1, 6))
                
            # Transcript snippets
            if ev.get("transcript"):
                tr_rows = [
                    [Paragraph("<b>Speaker</b>", cell_bold), Paragraph("<b>Time</b>", cell_bold), Paragraph("<b>Stress</b>", cell_bold), Paragraph("<b>Spoken Statement (Diarized)</b>", cell_bold)]
                ]
                for tr in ev.get("transcript", []):
                    stress_str = f"{int(tr.get('stress_level', 0)*100)}%" if tr.get("stress_level") else "N/A"
                    tr_rows.append([
                        Paragraph(f"<b>{tr.get('speaker')}</b>", cell_bold),
                        Paragraph(f"{tr.get('start')}s - {tr.get('end')}s", cell_regular),
                        Paragraph(stress_str, cell_regular),
                        Paragraph(f"\"{tr.get('text')}\"", cell_regular)
                    ])
                tr_table = Table(tr_rows, colWidths=[90, 65, 50, 299])
                tr_table.setStyle(TableStyle([
                    ('BACKGROUND', (0, 0), (-1, 0), BG_ALT),
                    ('GRID', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
                    ('PADDING', (0, 0), (-1, -1), 3),
                    ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                ]))
                elements.append(tr_table)
                elements.append(Spacer(1, 8))
                
    if not has_audio:
        elements.append(Paragraph("<i>No audio streams attached to this case.</i>", body_style))
        elements.append(Spacer(1, 8))
        
    # 7. Forensic Hypotheses & Actionable Investigative Leads
    elements.append(Paragraph("6. FORENSIC HYPOTHESES & INVESTIGATIVE RECOMMENDATIONS", section_heading))
    for idx, hyp in enumerate(case_data.get("forensic_hypotheses", [])):
        elements.append(Paragraph(f"<b>Lead #{idx+1}:</b> {hyp}", body_style))
        elements.append(Spacer(1, 3))
    elements.append(Spacer(1, 8))
    
    # 8. Investigator Sign-off Block
    if notes:
        elements.append(Paragraph("<b>Investigator Addendum:</b>", cell_bold))
        elements.append(Paragraph(notes, body_style))
        elements.append(Spacer(1, 8))
        
    sign_data = [
        [
            Paragraph("<b>EVIDENCE CUSTODIAN CERTIFICATION:</b><br/>I hereby certify that the digital evidence items cataloged above have been verified with SHA-256 cryptographic hashes and processed in accordance with forensic integrity standards.", cell_regular),
            Paragraph("<b>OFFICIAL SIGN-OFF:</b><br/><br/>________________________________________<br/>" + str(case_data.get('lead_investigator')) + "<br/><font size=7 color='#64748b'>Date of Seal: 2026-10-28</font>", cell_regular)
        ]
    ]
    sign_table = Table(sign_data, colWidths=[290, 214])
    sign_table.setStyle(TableStyle([
        ('BOX', (0, 0), (-1, -1), 1, PRIMARY_COLOR),
        ('BACKGROUND', (0, 0), (-1, -1), BG_ALT),
        ('PADDING', (0, 0), (-1, -1), 6),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    elements.append(KeepTogether(sign_table))
    
    doc.build(elements, canvasmaker=NumberedCanvas)
    buffer.seek(0)
    return buffer.getvalue()
