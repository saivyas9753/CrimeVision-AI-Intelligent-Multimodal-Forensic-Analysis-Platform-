import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Activity, 
  AlertTriangle, 
  Mic, 
  Radio, 
  Clock, 
  FastForward,
  Rewind
} from 'lucide-react';

export default function AudioAnalyzer({ audioEvidence }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(30);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [muted, setMuted] = useState(false);

  const audioRef = useRef(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      setCurrentTime(0);
    }
  }, [audioEvidence]);

  if (!audioEvidence) {
    return (
      <div className="tactical-panel" style={{ padding: '24px', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>No audio telemetry stream attached to this case.</p>
      </div>
    );
  }

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(e => console.log('Audio playback prevented:', e));
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration || audioEvidence.duration_sec || 30);
    }
  };

  const seekTo = (seconds) => {
    if (audioRef.current) {
      audioRef.current.currentTime = seconds;
      setCurrentTime(seconds);
    }
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const waveform = audioEvidence.waveform || [];
  const acousticEvents = audioEvidence.acoustic_events || [];
  const transcript = audioEvidence.transcript || [];

  return (
    <div className="tactical-panel hud-corner" style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        src={audioEvidence.file_url}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
      />

      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 18px',
        borderBottom: '1px solid var(--border-subtle)',
        background: 'rgba(8, 12, 22, 0.7)',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '6px',
            background: 'rgba(245, 158, 11, 0.15)',
            border: '1px solid rgba(245, 158, 11, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Activity size={18} color="#f59e0b" />
          </div>
          <div>
            <h4 style={{ fontSize: '0.9rem', color: '#ffffff', fontWeight: 600 }}>
              Forensic Acoustic Telemetry & Diarization
            </h4>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              {audioEvidence.title} &bull; Sensor: {audioEvidence.source}
            </span>
          </div>
        </div>

        {/* Audio Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => seekTo(Math.max(0, currentTime - 5))}
            className="btn btn-outline"
            style={{ padding: '6px 10px', fontSize: '0.75rem' }}
            title="Rewind 5s"
          >
            <Rewind size={14} />
          </button>

          <button
            onClick={togglePlay}
            className="btn btn-primary"
            style={{ padding: '6px 14px', fontSize: '0.8rem', minWidth: '90px' }}
          >
            {isPlaying ? <Pause size={15} /> : <Play size={15} />}
            <span>{isPlaying ? 'PAUSE' : 'PLAY'}</span>
          </button>

          <button
            onClick={() => seekTo(Math.min(duration, currentTime + 5))}
            className="btn btn-outline"
            style={{ padding: '6px 10px', fontSize: '0.75rem' }}
            title="Forward 5s"
          >
            <FastForward size={14} />
          </button>

          <button
            onClick={() => {
              if (audioRef.current) {
                audioRef.current.muted = !muted;
                setMuted(!muted);
              }
            }}
            className="btn btn-outline"
            style={{ padding: '6px 10px', fontSize: '0.75rem' }}
          >
            {muted ? <VolumeX size={14} color="#ff3366" /> : <Volume2 size={14} />}
          </button>

          <span className="font-mono" style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)', minWidth: '85px', textAlign: 'right' }}>
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>
      </div>

      {/* Waveform & Acoustic Events Bar */}
      <div style={{ padding: '16px 20px', background: 'rgba(6, 9, 15, 0.9)' }}>
        {/* Waveform Container */}
        <div style={{ position: 'relative', height: '80px', marginBottom: '8px' }}>
          {/* Waveform Bars */}
          <div 
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const pct = (e.clientX - rect.left) / rect.width;
              seekTo(pct * duration);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              height: '100%',
              gap: '2px',
              cursor: 'pointer',
              position: 'relative',
            }}
          >
            {waveform.map((val, idx) => {
              const barPct = (idx / waveform.length);
              const playedPct = currentTime / duration;
              const hasPlayed = barPct <= playedPct;
              
              return (
                <div
                  key={idx}
                  style={{
                    flex: 1,
                    height: `${val}%`,
                    background: hasPlayed 
                      ? 'linear-gradient(180deg, #00f0ff, #0284c7)' 
                      : 'rgba(255, 255, 255, 0.15)',
                    borderRadius: '2px',
                    transition: 'height 0.2s ease, background 0.1s ease',
                    boxShadow: hasPlayed && val > 70 ? '0 0 6px #00f0ff' : 'none',
                  }}
                />
              );
            })}

            {/* Playhead Scrubber Line */}
            <div style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: `${(currentTime / duration) * 100}%`,
              width: '2px',
              background: '#ffffff',
              boxShadow: '0 0 8px #00f0ff',
              pointerEvents: 'none',
            }}>
              <div style={{
                position: 'absolute',
                top: '-4px',
                left: '-4px',
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: '#00f0ff',
              }} />
            </div>
          </div>

          {/* Acoustic Transient Overlay Marker Pins */}
          {acousticEvents.map((ac) => {
            const eventPct = (ac.timestamp_sec / duration) * 100;
            const isGunshot = ac.event_type.toLowerCase().includes('gunshot') || ac.event_type.toLowerCase().includes('discharge');
            const pinColor = isGunshot ? '#ff3366' : '#f59e0b';

            return (
              <div
                key={ac.id}
                onClick={() => {
                  seekTo(ac.timestamp_sec);
                  setSelectedEvent(ac);
                }}
                title={`${ac.event_type} (${ac.decibels} dB)`}
                style={{
                  position: 'absolute',
                  left: `${eventPct}%`,
                  bottom: '-2px',
                  transform: 'translateX(-50%)',
                  cursor: 'pointer',
                  zIndex: 10,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <span className="badge" style={{
                  background: pinColor,
                  color: '#000000',
                  fontSize: '0.62rem',
                  padding: '1px 5px',
                  fontWeight: 800,
                  boxShadow: `0 0 10px ${pinColor}`,
                }}>
                  {ac.time_formatted} &bull; {ac.decibels}dB
                </span>
                <div style={{ width: '2px', height: '14px', background: pinColor }}></div>
              </div>
            );
          })}
        </div>

        {/* Selected Acoustic Anomaly Detail Box */}
        {selectedEvent && (
          <div style={{
            background: 'rgba(255, 51, 102, 0.12)',
            border: '1px solid rgba(255, 51, 102, 0.4)',
            borderRadius: 'var(--radius-sm)',
            padding: '8px 12px',
            marginTop: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={16} color="#ff3366" />
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#ff3366' }}>
                  {selectedEvent.event_type} ({selectedEvent.decibels} dB) @ {selectedEvent.time_formatted}
                </span>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                  {selectedEvent.description}
                </p>
              </div>
            </div>
            <button
              onClick={() => setSelectedEvent(null)}
              style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '0.75rem' }}
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* Diarized Transcript Section */}
      <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border-subtle)', background: 'rgba(10, 15, 29, 0.8)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-bright)', letterSpacing: '0.04em' }}>
            DIARIZED WITNESS & DISPATCH TRANSCRIPT
          </span>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            Click statement to jump playhead
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '220px', overflowY: 'auto' }}>
          {transcript.map((tr) => {
            const isActive = currentTime >= tr.start && currentTime <= tr.end;
            const isWitness = tr.speaker.toLowerCase().includes('witness') || tr.speaker.toLowerCase().includes('clerk');
            const speakerColor = isWitness ? '#00f0ff' : (tr.speaker.toLowerCase().includes('suspect') ? '#ff3366' : '#38bdf8');

            return (
              <div
                key={tr.id}
                onClick={() => seekTo(tr.start)}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-sm)',
                  background: isActive ? 'rgba(0, 240, 255, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                  border: isActive ? '1px solid var(--accent-cyan)' : '1px solid transparent',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {/* Timestamp & Speaker Tag */}
                <div style={{ minWidth: '130px' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: speakerColor }}>
                    {tr.speaker}
                  </div>
                  <div className="font-mono" style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                    [{tr.start.toFixed(1)}s - {tr.end.toFixed(1)}s]
                  </div>
                </div>

                {/* Spoken Text */}
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '0.8rem', color: isActive ? '#ffffff' : 'var(--text-primary)', lineHeight: 1.4 }}>
                    "{tr.text}"
                  </p>
                </div>

                {/* Stress Level Indicator */}
                {tr.stress_level != null && (
                  <div style={{ minWidth: '85px', textAlign: 'right' }}>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '2px' }}>
                      Stress: {Math.round(tr.stress_level * 100)}%
                    </div>
                    <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{
                        width: `${tr.stress_level * 100}%`,
                        height: '100%',
                        background: tr.stress_level > 0.7 ? '#ff3366' : (tr.stress_level > 0.4 ? '#f59e0b' : '#10b981'),
                      }} />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
