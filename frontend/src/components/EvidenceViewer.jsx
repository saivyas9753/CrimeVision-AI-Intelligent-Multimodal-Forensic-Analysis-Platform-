import React, { useState, useRef, useEffect } from 'react';
import { 
  Crosshair, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Layers, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  Sliders, 
  Info,
  Maximize2,
  Copy,
  Check
} from 'lucide-react';

export default function EvidenceViewer({ evidenceList = [], activeEvidenceId, onSelectEvidence }) {
  const activeItem = evidenceList.find((e) => e.id === activeEvidenceId) || evidenceList[0];

  // Visual Inspection Controls
  const [showBoxes, setShowBoxes] = useState(true);
  const [showHud, setShowHud] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [minConfidence, setMinConfidence] = useState(80);
  const [zoom, setZoom] = useState(1);
  const [activeDetectionId, setActiveDetectionId] = useState(null);
  const [copiedHash, setCopiedHash] = useState(false);

  const containerRef = useRef(null);

  // Copy SHA256 to clipboard
  const handleCopyHash = (hash) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  if (!activeItem) {
    return (
      <div className="tactical-panel" style={{ padding: '40px', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>No evidence records loaded for this case.</p>
      </div>
    );
  }

  const detections = (activeItem.detections || []).filter((det) => {
    const meetsConfidence = (det.confidence * 100) >= minConfidence;
    const meetsCategory = selectedCategory === 'all' || det.category === selectedCategory;
    return meetsConfidence && meetsCategory;
  });

  return (
    <div className="tactical-panel hud-corner" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Evidence Category / Tab Selector Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px',
        borderBottom: '1px solid var(--border-subtle)',
        background: 'rgba(8, 12, 22, 0.7)',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        {/* Evidence Items Thumbnails/Tabs */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', maxWidth: '100%' }}>
          {evidenceList.map((ev) => {
            const isSelected = ev.id === activeItem.id;
            return (
              <button
                key={ev.id}
                onClick={() => {
                  onSelectEvidence(ev.id);
                  setZoom(1);
                  setActiveDetectionId(null);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-sm)',
                  background: isSelected ? 'rgba(0, 240, 255, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                  border: isSelected ? '1px solid var(--accent-cyan)' : '1px solid var(--border-subtle)',
                  color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  fontSize: '0.8rem',
                  fontFamily: 'var(--font-mono)',
                  whiteSpace: 'nowrap'
                }}
              >
                <span style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  background: ev.type === 'image' ? '#00e5ff' : '#f59e0b',
                }}></span>
                <span style={{ fontWeight: 600 }}>[{ev.id}]</span>
                <span style={{ maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {ev.title.split(':')[0]}
                </span>
              </button>
            );
          })}
        </div>

        {/* View Controls: Toggle Bounding Boxes, HUD, Zoom */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => setShowBoxes(!showBoxes)}
            className="btn btn-outline"
            style={{ padding: '5px 10px', fontSize: '0.75rem' }}
            title="Toggle Bounding Boxes Overlay"
          >
            {showBoxes ? <Eye size={14} color="#00f0ff" /> : <EyeOff size={14} />}
            <span>Boxes ({detections.length})</span>
          </button>

          <button
            onClick={() => setShowHud(!showHud)}
            className="btn btn-outline"
            style={{ padding: '5px 10px', fontSize: '0.75rem' }}
            title="Toggle CCTV HUD Viewfinder"
          >
            <Crosshair size={14} color={showHud ? "#00f0ff" : "#64748b"} />
            <span>HUD</span>
          </button>

          {/* Zoom Buttons */}
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
            <button
              onClick={() => setZoom((z) => Math.min(2.5, z + 0.25))}
              style={{ background: 'transparent', border: 'none', color: '#fff', padding: '5px 8px', cursor: 'pointer' }}
              title="Zoom In"
            >
              <ZoomIn size={14} />
            </button>
            <span style={{ fontSize: '0.7rem', display: 'flex', alignItems: 'center', padding: '0 4px', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom((z) => Math.max(0.75, z - 0.25))}
              style={{ background: 'transparent', border: 'none', color: '#fff', padding: '5px 8px', cursor: 'pointer' }}
              title="Zoom Out"
            >
              <ZoomOut size={14} />
            </button>
            <button
              onClick={() => setZoom(1)}
              style={{ background: 'transparent', border: 'none', color: '#94a3b8', padding: '5px 8px', cursor: 'pointer' }}
              title="Reset Zoom"
            >
              <RotateCcw size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Evidence Canvas & Metadata Split Area */}
      <div className="responsive-evidence-layout">
        
        {/* Left: Viewport / Interactive Canvas */}
        <div 
          ref={containerRef}
          className="scanline-container"
          style={{
            position: 'relative',
            background: '#04070d',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            userSelect: 'none',
          }}
        >
          {activeItem.type === 'image' || activeItem.type === 'video' ? (
            <div style={{
              position: 'relative',
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transform: `scale(${zoom})`,
              transition: 'transform 0.15s ease-out',
            }}>
              {/* Surveillance Image */}
              <img
                src={activeItem.file_url}
                alt={activeItem.title}
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                  boxShadow: '0 0 30px rgba(0,0,0,0.8)',
                  display: 'block',
                }}
              />

              {/* Bounding Box Overlays */}
              {showBoxes && detections.map((det) => {
                const bbox = det.bbox;
                if (!bbox) return null;
                const isTargeted = activeDetectionId === det.id;
                const color = bbox.color || (det.category === 'weapon' ? '#ff3366' : (det.category === 'person' ? '#00e5ff' : '#f59e0b'));

                return (
                  <div
                    key={det.id}
                    onMouseEnter={() => setActiveDetectionId(det.id)}
                    onMouseLeave={() => setActiveDetectionId(null)}
                    style={{
                      position: 'absolute',
                      left: `${bbox.x}%`,
                      top: `${bbox.y}%`,
                      width: `${bbox.w}%`,
                      height: `${bbox.h}%`,
                      border: `2px solid ${color}`,
                      borderRadius: '3px',
                      background: isTargeted ? `${color}25` : `${color}10`,
                      boxShadow: isTargeted ? `0 0 16px ${color}, inset 0 0 8px ${color}40` : `0 0 8px ${color}30`,
                      cursor: 'pointer',
                      zIndex: isTargeted ? 20 : 15,
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {/* Bounding Box Tag Label */}
                    <div style={{
                      position: 'absolute',
                      top: '-24px',
                      left: '-2px',
                      background: color,
                      color: '#000000',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      padding: '2px 6px',
                      borderRadius: '3px 3px 0 0',
                      letterSpacing: '0.04em',
                      whiteSpace: 'nowrap',
                      boxShadow: `0 2px 8px ${color}60`,
                    }}>
                      {bbox.label || `${det.label} [${Math.round(det.confidence * 100)}%]`}
                    </div>

                    {/* Corner Reticle Ticks */}
                    <div style={{ position: 'absolute', top: 0, left: 0, width: '6px', height: '6px', borderTop: '2px solid #fff', borderLeft: '2px solid #fff' }}></div>
                    <div style={{ position: 'absolute', bottom: 0, right: 0, width: '6px', height: '6px', borderBottom: '2px solid #fff', borderRight: '2px solid #fff' }}></div>
                  </div>
                );
              })}

              {/* High-Tech Tactical Reticles */}
              {showHud && (
                <div style={{
                  position: 'absolute',
                  inset: '20px',
                  border: '1px solid rgba(0, 240, 255, 0.15)',
                  pointerEvents: 'none',
                }}>
                  {/* Top Status Banner */}
                  <div style={{
                    position: 'absolute',
                    top: '10px',
                    left: '12px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.72rem',
                    color: '#ff3366',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <span className="pulse-red"></span>
                    <span>LIVE SURVEILLANCE FEED &bull; FORENSIC LAYER ENABLED</span>
                  </div>

                  <div style={{
                    position: 'absolute',
                    top: '10px',
                    right: '12px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.72rem',
                    color: 'var(--accent-cyan)',
                  }}>
                    {activeItem.timestamp}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Audio File Ingestion State */
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'rgba(245, 158, 11, 0.15)',
                border: '1px solid #f59e0b',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
                boxShadow: '0 0 20px rgba(245, 158, 11, 0.25)'
              }}>
                <span style={{ fontSize: '1.5rem' }}>🎙️</span>
              </div>
              <h4 style={{ color: '#ffffff', marginBottom: '8px' }}>{activeItem.title}</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', maxWidth: '400px', margin: '0 auto' }}>
                Acoustic telemetry stream. Inspect waveform, decibel spikes, and diarized transcripts in the forensic audio console below.
              </p>
            </div>
          )}
        </div>

        {/* Right Sidebar: Forensic Metadata & Isolated Detections */}
        <div style={{
          background: 'rgba(10, 15, 29, 0.95)',
          borderLeft: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
          padding: '16px',
          gap: '16px'
        }}>
          {/* Header Info */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span className="badge badge-cyan">{activeItem.id}</span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{activeItem.source}</span>
            </div>
            <h3 style={{ fontSize: '1rem', color: '#ffffff', fontWeight: 600, lineHeight: 1.3 }}>
              {activeItem.title}
            </h3>
          </div>

          {/* Cryptographic Hash Verification */}
          <div style={{
            background: 'rgba(16, 24, 44, 0.7)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            padding: '10px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                SHA-256 Digest
              </span>
              <button
                onClick={() => handleCopyHash(activeItem.sha256)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: copiedHash ? '#10b981' : 'var(--accent-cyan)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.68rem',
                }}
              >
                {copiedHash ? <Check size={11} /> : <Copy size={11} />}
                <span>{copiedHash ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <div className="font-mono" style={{ fontSize: '0.68rem', color: '#38bdf8', wordBreak: 'break-all' }}>
              {activeItem.sha256}
            </div>
          </div>

          {/* Filter Controls (Category & Confidence Slider) */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            padding: '10px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Filter Category:</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                style={{
                  background: '#0d1322',
                  border: '1px solid var(--border-subtle)',
                  color: '#ffffff',
                  fontSize: '0.75rem',
                  borderRadius: '4px',
                  padding: '2px 6px',
                  outline: 'none',
                }}
              >
                <option value="all">All Targets</option>
                <option value="weapon">Weapons (Lethal)</option>
                <option value="person">Persons of Interest</option>
                <option value="object">Physical Evidence</option>
              </select>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '3px' }}>
                <span>Min AI Confidence:</span>
                <span style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>{minConfidence}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="99"
                value={minConfidence}
                onChange={(e) => setMinConfidence(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--accent-cyan)', cursor: 'pointer' }}
              />
            </div>
          </div>

          {/* Isolated Targets List */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-bright)', letterSpacing: '0.04em' }}>
                IDENTIFIED TARGETS ({detections.length})
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {detections.map((det) => {
                const isTargeted = activeDetectionId === det.id;
                const isWeapon = det.category === 'weapon';
                const tagColor = isWeapon ? '#ff3366' : (det.category === 'person' ? '#00e5ff' : '#f59e0b');

                return (
                  <div
                    key={det.id}
                    onMouseEnter={() => setActiveDetectionId(det.id)}
                    onMouseLeave={() => setActiveDetectionId(null)}
                    style={{
                      padding: '10px',
                      borderRadius: 'var(--radius-sm)',
                      background: isTargeted ? 'rgba(0, 240, 255, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                      border: isTargeted ? `1px solid ${tagColor}` : '1px solid var(--border-subtle)',
                      transition: 'all 0.2s ease',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: tagColor }}>
                        {det.label}
                      </span>
                      <span className="font-mono" style={{ fontSize: '0.75rem', fontWeight: 700, color: '#ffffff' }}>
                        {Math.round(det.confidence * 100)}%
                      </span>
                    </div>

                    <p style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', lineHeight: 1.35, marginBottom: '6px' }}>
                      {det.description}
                    </p>

                    {/* Flags */}
                    {det.flags && det.flags.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {det.flags.map((flg, idx) => (
                          <span
                            key={idx}
                            style={{
                              fontSize: '0.65rem',
                              padding: '2px 5px',
                              borderRadius: '3px',
                              background: 'rgba(255, 51, 102, 0.15)',
                              color: '#ff3366',
                              border: '1px solid rgba(255, 51, 102, 0.3)',
                              fontWeight: 600,
                            }}
                          >
                            {flg}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Forensic Notes */}
          {activeItem.forensic_notes && (
            <div style={{
              marginTop: 'auto',
              padding: '10px',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(56, 189, 248, 0.06)',
              border: '1px solid rgba(56, 189, 248, 0.2)',
            }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--accent-cyan)', fontWeight: 600, textTransform: 'uppercase', display: 'block', marginBottom: '3px' }}>
                Forensic Examiner Note:
              </span>
              <p style={{ fontSize: '0.73rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                {activeItem.forensic_notes}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
