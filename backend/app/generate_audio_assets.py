import wave
import math
import struct
from pathlib import Path
from .config import UPLOADS_DIR

STATIC_DIR = UPLOADS_DIR / "static"
STATIC_DIR.mkdir(parents=True, exist_ok=True)

def generate_tone(duration_s, freq_func, sample_rate=22050):
    n_samples = int(duration_s * sample_rate)
    samples = []
    for i in range(n_samples):
        t = i / sample_rate
        freq, amp = freq_func(t)
        val = int(amp * 32767 * math.sin(2 * math.pi * freq * t))
        samples.append(max(-32767, min(32767, val)))
    return samples

def write_wav(filename, samples, sample_rate=22050):
    filepath = STATIC_DIR / filename
    with wave.open(str(filepath), "w") as wav_file:
        wav_file.setnchannels(1)  # Mono
        wav_file.setsampwidth(2)  # 16-bit
        wav_file.setframerate(sample_rate)
        raw_bytes = struct.pack(f"<{len(samples)}h", *samples)
        wav_file.writeframes(raw_bytes)
    print(f"Generated audio: {filename} ({len(samples)/sample_rate:.1f}s)")

def make_911_audio():
    # 30s synthesized 911 dispatch radio with gunshot blast at t=12s
    def sound_profile(t):
        # Gunshot impulse at t=12.0s
        if 12.0 <= t <= 12.4:
            decay = math.exp(-(t - 12.0) * 12)
            return (180 + 800 * math.exp(-(t - 12.0)*25), 0.95 * decay)
        # Radio static / beeps / vocal carrier simulation
        elif int(t * 2) % 6 == 0:
            return (850, 0.25)
        elif int(t * 3) % 4 == 0:
            return (440, 0.3)
        else:
            # Low hum
            return (120, 0.08)
            
    samples = generate_tone(30.0, sound_profile)
    write_wav("911_dispatch_call_CV0892.wav", samples)

def make_hydrophone_audio():
    # Subsurface motor cavitation hum
    def sound_profile(t):
        freq = 90 + 30 * math.sin(2 * math.pi * 0.5 * t)
        amp = 0.25 + 0.15 * math.sin(2 * math.pi * 2.0 * t)
        if 20.0 <= t <= 23.0:
            return (2200, 0.5)  # Hissing metal cut
        return (freq, amp)
        
    samples = generate_tone(25.0, sound_profile)
    write_wav("hydrophone_wharf_0241.wav", samples)

def make_transit_audio():
    def sound_profile(t):
        if 8.0 <= t <= 11.0:
            return (1200, 0.6)  # Panic vocal alert
        return (180 + 40 * math.sin(t), 0.15)
        
    samples = generate_tone(20.0, sound_profile)
    write_wav("witness_transit_audio.wav", samples)

def generate_all_audio():
    make_911_audio()
    make_hydrophone_audio()
    make_transit_audio()
    print("All forensic audio assets generated.")

if __name__ == "__main__":
    generate_all_audio()
