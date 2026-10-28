import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Video, 
  Mic, 
  Zap, 
  AlertCircle, 
  Play, 
  Pause, 
  SkipForward, 
  Filter,
  CheckCircle2
} from 'lucide-react';

export default function TimelineView({ timeline = [], onSelectEvidence, activeEvidenceId }) {
  const [filterModality, setFilterModality] = useState('all');
  const [autoPlay, setAutoPlay] = useState(false);
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  // Auto-play step-through timeline simulation
  useEffect(() => {
    let interval = null;
    if (autoPlay && timeline.length > 0) {
      interval = setInterval(() => {
        setActiveStepIndex((prev) => (prev + 1) % timeline.length);
      }, 3500);
    }
    return () => clearInterval(interval);
  }, [autoPlay, timeline]);

  useEffect(() => {
    if (autoPlay && timeline.length > 0) {
      const evId = timeline[activeStepIndex]?.evidence_id;
      if (evId && onSelectEvidence) {
        onSelectEvidence(evId);
      }
    }
  }, [activeStepIndex, autoPlay, timeline, onSelectEvidence]);

  const filteredTimeline = timeline.filter((evt) => {
    if (filterModality === 'all') return true;
    return evt.modality === filterModality;
  });

  return (
    <div className="tactical-panel hud-corner" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 18px',
        borderBottom: '1px solid var(--border-subtle)',
        background: 'rgba(8, 12, 22, 0.7)',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Clock size={18} color="var(--accent-cyan)" />
          <h4 style={{ fontSize: '0.9rem', color: '#ffffff', fontWeight: 600 }}>
            Unified Chronological Reconstruction Timeline
          </h4>
          <span className="badge badge-cyan" style={{ fontSize: '0.68rem' }}>
            {filteredTimeline.length} Milestones
          </span>
        </div>

        {/* Action Controls: Modality Filters & Auto-Play */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Modality Filter Pills */}
          <div style={{ display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.03)', padding: '2px', borderRadius: 'var(--radius-sm)' }}>
            {[
              { id: 'all', label: 'All' },
              { id: 'visual', label: 'Visual', icon: Video },
              { id: 'audio', label: 'Audio', icon: Mic },
              { id: 'hybrid', label: 'Hybrid', icon: Zap }
            ].map((btn) => {
              const active = filterModality === btn.id;
              return (
                <button
                  key={btn.id}
                  onClick={() => setFilterModality(btn.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px 8px',
                    border: 'none',
                    borderRadius: '4px',
                    background: active ? 'var(--accent-cyan)' : 'transparent',
                    color: active ? '#000000' : 'var(--text-secondary)',
                    fontWeight: 600,
                    fontSize: '0.72rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {btn.icon && <btn.icon size={11} />}
                  <span>{btn.label}</span>
                </button>
              );
            })}
          </div>

          {/* Auto Step-Through Reconstruction Player */}
          <button
            onClick={() => setAutoPlay(!autoPlay)}
            className="btn btn-outline"
            style={{
              padding: '5px 10px',
              fontSize: '0.75rem',
              borderColor: autoPlay ? 'var(--accent-cyan)' : 'var(--border-subtle)',
              color: autoPlay ? 'var(--accent-cyan)' : 'var(--text-primary)',
            }}
            title="Auto-step through chronological events"
          >
            {autoPlay ? <Pause size={13} /> : <Play size={13} />}
            <span>{autoPlay ? 'Simulating' : 'Simulate'}</span>
          </button>
        </div>
      </div>

      {/* Timeline Events List */}
      <div style={{
        padding: '16px 20px',
        overflowY: 'auto',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        position: 'relative',
      }}>
        {/* Vertical Connecting Guide Wire */}
        <div style={{
          position: 'absolute',
          top: '24px',
          bottom: '24px',
          left: '35px',
          width: '2px',
          background: 'linear-gradient(180deg, var(--accent-cyan) 0%, rgba(56, 189, 248, 0.2) 100%)',
          pointerEvents: 'none',
        }} />

        {filteredTimeline.map((evt, idx) => {
          const isSelected = activeStepIndex === idx;
          const isCritical = evt.severity === 'critical';
          const isWarning = evt.severity === 'warning';
          const nodeColor = isCritical ? '#ff3366' : (isWarning ? '#f59e0b' : '#00f0ff');

          return (
            <div
              key={evt.id}
              onClick={() => {
                setActiveStepIndex(idx);
                if (evt.evidence_id && onSelectEvidence) {
                  onSelectEvidence(evt.evidence_id);
                }
              }}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '16px',
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                background: isSelected ? 'rgba(0, 240, 255, 0.1)' : 'rgba(255, 255, 255, 0.02)',
                border: isSelected ? `1px solid ${nodeColor}` : '1px solid var(--border-subtle)',
                boxShadow: isSelected ? `0 0 15px ${nodeColor}30` : 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                position: 'relative',
              }}
            >
              {/* Event Time Node */}
              <div style={{
                zIndex: 2,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                minWidth: '55px',
              }}>
                <div style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  background: nodeColor,
                  boxShadow: `0 0 8px ${nodeColor}`,
                  marginBottom: '6px',
                }} />
                <span className="font-mono" style={{ fontSize: '0.72rem', fontWeight: 700, color: '#ffffff' }}>
                  {evt.timestamp}
                </span>
              </div>

              {/* Event Content Details */}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: isCritical ? '#ff3366' : '#ffffff' }}>
                      {evt.title}
                    </span>
                    <span className="badge" style={{
                      fontSize: '0.62rem',
                      background: evt.modality === 'visual' ? 'rgba(0, 240, 255, 0.15)' : (evt.modality === 'audio' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(255, 51, 102, 0.15)'),
                      color: evt.modality === 'visual' ? '#00f0ff' : (evt.modality === 'audio' ? '#f59e0b' : '#ff3366'),
                      border: 'none',
                    }}>
                      {evt.modality.toUpperCase()}
                    </span>
                  </div>

                  {/* Evidence Reference Pill */}
                  {evt.evidence_id && (
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onSelectEvidence) onSelectEvidence(evt.evidence_id);
                      }}
                      className="badge badge-cyan"
                      style={{ fontSize: '0.65rem', cursor: 'pointer' }}
                      title="Inspect Linked Evidence"
                    >
                      {evt.evidence_id} &rarr;
                    </span>
                  )}
                </div>

                <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: '6px' }}>
                  {evt.description}
                </p>

                {/* Tags */}
                {evt.tags && evt.tags.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                    {evt.tags.map((tg, tIdx) => (
                      <span
                        key={tIdx}
                        style={{
                          fontSize: '0.65rem',
                          padding: '2px 6px',
                          borderRadius: '3px',
                          background: 'rgba(255,255,255,0.05)',
                          color: 'var(--text-muted)',
                          fontFamily: 'var(--font-mono)',
                        }}
                      >
                        #{tg}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
