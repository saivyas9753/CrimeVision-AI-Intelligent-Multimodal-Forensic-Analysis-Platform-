from PIL import Image, ImageDraw, ImageFont
import numpy as np
from pathlib import Path
from .config import UPLOADS_DIR

STATIC_DIR = UPLOADS_DIR / "static"
STATIC_DIR.mkdir(parents=True, exist_ok=True)

def add_cctv_hud(draw, width, height, cam_name, timestamp, fps="30 FPS"):
    # REC dot
    draw.ellipse([30, 28, 46, 44], fill="#ef4444")
    draw.text((55, 26), f"REC ●  {cam_name}", fill="#ffffff")
    draw.text((width - 340, 26), f"{timestamp}  {fps}", fill="#00e5ff")
    
    # Corner brackets (HUD viewfinder)
    bracket_len = 40
    bracket_color = "#38bdf8"
    # Top-left
    draw.line([(25, 20), (25 + bracket_len, 20)], fill=bracket_color, width=2)
    draw.line([(25, 20), (25, 20 + bracket_len)], fill=bracket_color, width=2)
    # Top-right
    draw.line([(width - 25, 20), (width - 25 - bracket_len, 20)], fill=bracket_color, width=2)
    draw.line([(width - 25, 20), (width - 25, 20 + bracket_len)], fill=bracket_color, width=2)
    # Bottom-left
    draw.line([(25, height - 20), (25 + bracket_len, height - 20)], fill=bracket_color, width=2)
    draw.line([(25, height - 20), (25, height - 20 - bracket_len)], fill=bracket_color, width=2)
    # Bottom-right
    draw.line([(width - 25, height - 20), (width - 25 - bracket_len, height - 20)], fill=bracket_color, width=2)
    draw.line([(width - 25, height - 20), (width - 25, height - 20 - bracket_len)], fill=bracket_color, width=2)
    
    # Center crosshair
    cx, cy = width // 2, height // 2
    draw.line([(cx - 15, cy), (cx + 15, cy)], fill="#00e5ff88", width=1)
    draw.line([(cx, cy - 15), (cx, cy + 15)], fill="#00e5ff88", width=1)
    draw.ellipse([cx - 25, cy - 25, cx + 25, cy + 25], outline="#00e5ff55", width=1)

def create_cctv_entrance():
    w, h = 1920, 1080
    # Create base dark CCTV convenience store scene
    arr = np.zeros((h, w, 3), dtype=np.uint8)
    # Background interior gradient
    for y in range(h):
        val = int(25 + 30 * (y / h))
        arr[y, :, :] = [val, val + 5, val + 10]
        
    img = Image.fromarray(arr)
    draw = ImageDraw.Draw(img)
    
    # Store aisles & shelving perspective
    draw.polygon([(0, 300), (450, 450), (450, 1080), (0, 1080)], fill="#1e293b", outline="#334155")
    draw.polygon([(1470, 450), (1920, 300), (1920, 1080), (1470, 1080)], fill="#1e293b", outline="#334155")
    # Sliding doors threshold
    draw.rectangle([550, 200, 1370, 1000], fill="#0f172a", outline="#475569", width=3)
    draw.line([(960, 200), (960, 1000)], fill="#475569", width=2)
    
    # Suspect Silhouette entering
    draw.ellipse([880, 280, 1040, 460], fill="#111827")  # Hooded head
    draw.polygon([(820, 450), (1100, 450), (1150, 920), (770, 920)], fill="#090d16")  # Torso / hoodie
    draw.rectangle([800, 900, 940, 1080], fill="#05070a")  # Left leg
    draw.rectangle([980, 900, 1120, 1080], fill="#05070a") # Right leg
    # Duffle bag slung
    draw.ellipse([760, 520, 880, 750], fill="#1e293b", outline="#475569")
    
    add_cctv_hud(draw, w, h, "CAM 01 - NORTH STORE ENTRANCE", "2026-10-24 22:13:58")
    img.save(STATIC_DIR / "cctv_entrance_breach.jpg", quality=90)

def create_cctv_counter():
    w, h = 1920, 1080
    arr = np.zeros((h, w, 3), dtype=np.uint8)
    for y in range(h):
        val = int(20 + 25 * (y / h))
        arr[y, :, :] = [val + 4, val + 2, val]
        
    img = Image.fromarray(arr)
    draw = ImageDraw.Draw(img)
    
    # Cash Counter surface
    draw.polygon([(400, 650), (1920, 600), (1920, 1080), (300, 1080)], fill="#1e293b", outline="#475569", width=3)
    # Cash register
    draw.rectangle([700, 650, 1200, 950], fill="#0f172a", outline="#64748b", width=2)
    draw.rectangle([720, 720, 1180, 900], fill="#334155", outline="#94a3b8")  # Open drawer
    # Suspect holding firearm
    draw.ellipse([300, 250, 480, 450], fill="#0f172a")  # Suspect head/hood
    draw.polygon([(240, 430), (550, 430), (620, 950), (180, 950)], fill="#090d16")
    # Arm aiming weapon
    draw.polygon([(500, 480), (950, 420), (970, 470), (520, 540)], fill="#111827")
    # Handgun (Glock silhouette)
    draw.rectangle([940, 400, 1140, 470], fill="#020408", outline="#38bdf8", width=1)
    draw.rectangle([960, 460, 1020, 580], fill="#020408")  # Grip
    
    # Victim (Cashier) with hands up
    draw.ellipse([1450, 260, 1600, 430], fill="#1e293b")  # Cashier head
    draw.rectangle([1400, 430, 1660, 920], fill="#166534")  # Green store uniform
    # Raised arms
    draw.line([(1400, 450), (1340, 250)], fill="#166534", width=28)
    draw.line([(1660, 450), (1720, 250)], fill="#166534", width=28)
    
    add_cctv_hud(draw, w, h, "CAM 02 - CASH REGISTER CLOSEUP", "2026-10-24 22:14:18", "60 FPS")
    img.save(STATIC_DIR / "cctv_counter_brandish.jpg", quality=90)

def create_flir_thermal():
    w, h = 1280, 720
    # Thermal FLIR palette (cold dark purple/blue, warm orange, hot white)
    arr = np.zeros((h, w, 3), dtype=np.uint8)
    # Harbor water cold gradient
    for y in range(h):
        arr[y, :, 0] = int(20 + 30 * (y / h))  # R
        arr[y, :, 1] = int(10 + 20 * (y / h))  # G
        arr[y, :, 2] = int(50 + 60 * (y / h))  # B
        
    img = Image.fromarray(arr)
    draw = ImageDraw.Draw(img)
    
    # Pier concrete deck
    draw.polygon([(100, 300), (1280, 250), (1280, 720), (50, 720)], fill="#2e1065", outline="#4c1d95")
    # Cargo container
    draw.rectangle([550, 180, 1150, 620], fill="#3b0764", outline="#7c3aed", width=2)
    # Thermal white-hot cutter torch bloom
    draw.ellipse([630, 340, 750, 440], fill="#ffffff")
    draw.ellipse([600, 310, 780, 470], fill="#f59e0b55")
    
    # Infiltrator thermal silhouette (warm orange/yellow heat body)
    draw.ellipse([500, 240, 580, 330], fill="#fb923c")
    draw.polygon([(470, 330), (610, 330), (640, 620), (440, 620)], fill="#f97316")
    
    # FLIR HUD
    draw.text((30, 26), "FLIR LWIR INFRARED ● BERTH 9", fill="#fbbf24")
    draw.text((w - 280, 26), "2026-10-22 02:41:52", fill="#ffffff")
    draw.text((30, h - 40), "RANGE: 7.5-14um  SENS: <30mK", fill="#93c5fd")
    draw.text((w - 200, h - 40), "MAX TEMP: 2840°C", fill="#f43f5e")
    
    img.save(STATIC_DIR / "flir_pier_breach.jpg", quality=90)

def create_transit_assault():
    w, h = 1920, 1080
    arr = np.zeros((h, w, 3), dtype=np.uint8)
    for y in range(h):
        val = int(35 + 20 * (y / h))
        arr[y, :, :] = [val, val + 2, val + 5]
        
    img = Image.fromarray(arr)
    draw = ImageDraw.Draw(img)
    
    # Subway concourse tiles & escalator handrails
    draw.polygon([(500, 200), (900, 200), (1500, 1080), (800, 1080)], fill="#1e293b", outline="#475569", width=2)
    draw.line([(500, 200), (800, 1080)], fill="#38bdf8", width=8)  # Left handrail
    draw.line([(900, 200), (1500, 1080)], fill="#38bdf8", width=8) # Right handrail
    
    # Suspect in red beanie
    draw.ellipse([750, 280, 890, 420], fill="#ef4444")  # Red beanie
    draw.polygon([(700, 420), (960, 420), (1020, 960), (660, 960)], fill="#78350f")  # Leather bomber jacket
    # Hand brandishing tactical blade
    draw.rectangle([950, 480, 1080, 550], fill="#0f172a", outline="#f43f5e", width=2)
    
    add_cctv_hud(draw, w, h, "CAM 14 - METRO ESCALATOR 3", "2026-10-18 17:42:15")
    img.save(STATIC_DIR / "transit_escalator_assault.jpg", quality=90)

def generate_all():
    create_cctv_entrance()
    create_cctv_counter()
    create_flir_thermal()
    create_transit_assault()
    print("All forensic visual assets generated successfully.")

if __name__ == "__main__":
    generate_all()
