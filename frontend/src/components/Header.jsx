import React from 'react';
import { 
  ShieldAlert, 
  FileText, 
  UploadCloud, 
  MessageSquare, 
  Radio, 
  Cpu, 
  Lock,
  ChevronDown,
  Layers,
  MapPin
} from 'lucide-react';

export default function Header({ 
  cases = [], 
  currentCase, 
  onSelectCase, 
  onOpenUpload, 
  onOpenReport, 
  onToggleChat,
  chatOpen,
  health
}) {
  return (
    <header style={{
      background: 'rgba(10, 15, 29, 0.92)',
      borderBottom: '1px solid var(--border-subtle)',
      backdropFilter: 'blur(20px)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      padding: '12px 24px',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '20px',
        maxWidth: '1920px',
        margin: '0 auto',
      }}>
        {/* Left: Branding & Tactical System Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.2), rgba(99, 102, 241, 0.3))',
            border: '1px solid rgba(0, 240, 255, 0.5)',
            boxShadow: '0 0 15px rgba(0, 240, 255, 0.3)'
          }}>
            <ShieldAlert size={24} color="#00f0ff" />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="font-display" style={{ 
                fontSize: '1.25rem', 
                fontWeight: 700, 
                letterSpacing: '0.02em',
                background: 'linear-gradient(90deg, #ffffff, #38bdf8)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                CRIMEVISION AI
              </span>
              <span className="badge badge-cyan" style={{ fontSize: '0.65rem' }}>
                <span className="pulse-cyan" style={{ width: '6px', height: '6px' }}></span>
                FORENSIC HUD v1.0
              </span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', gap: '12px', alignItems: 'center' }}>
              <span>Multimodal Forensic Intelligence Platform</span>
              <span style={{ color: 'rgba(56, 189, 248, 0.3)' }}>|</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#10b981' }}>
                <Lock size={11} /> SHA-256 CHAIN OF CUSTODY VERIFIED
              </span>
            </div>
          </div>
        </div>

        {/* Center: Case Switcher Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ position: 'relative' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '6px 14px',
              background: 'rgba(16, 24, 44, 0.85)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              borderRadius: 'var(--radius-sm)',
              boxShadow: '0 2px 10px rgba(0,0,0,0.4)',
            }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Active Case:
              </span>
              <select
                value={currentCase?.id || ''}
                onChange={(e) => onSelectCase(e.target.value)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--accent-cyan)',
                  fontSize: '0.88rem',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 600,
                  outline: 'none',
                  cursor: 'pointer',
                  paddingRight: '12px',
                }}
              >
                {cases.map((c) => (
                  <option key={c.id} value={c.id} style={{ background: '#0d1322', color: '#f8fafc' }}>
                    [{c.id}] {c.title} ({c.threat_level})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Incident Threat Level Indicator */}
          {currentCase && (
            <div className={`badge ${currentCase.threat_level === 'Critical' ? 'badge-danger' : 'badge-warning'}`}
              style={{ padding: '6px 12px', fontSize: '0.72rem' }}>
              <span className={currentCase.threat_level === 'Critical' ? 'pulse-red' : 'pulse-cyan'}></span>
              THREAT: {currentCase.threat_level}
            </div>
          )}
        </div>

        {/* Right: Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Upload Button */}
          <button 
            onClick={onOpenUpload}
            className="btn btn-outline"
            style={{ fontSize: '0.8rem', padding: '7px 12px' }}
            title="Upload new image, video or audio evidence"
          >
            <UploadCloud size={16} color="#38bdf8" />
            <span>Ingest Evidence</span>
          </button>

          {/* PDF Report Export */}
          <button 
            onClick={onOpenReport}
            className="btn btn-primary"
            style={{ fontSize: '0.8rem', padding: '7px 14px' }}
            title="Generate Official Forensic Examination Dossier (PDF)"
          >
            <FileText size={16} />
            <span>Forensic Dossier (PDF)</span>
          </button>

          {/* AI Investigator Chat Drawer Toggle */}
          <button 
            onClick={onToggleChat}
            className={`btn ${chatOpen ? 'btn-cyan' : 'btn-outline'}`}
            style={{ fontSize: '0.8rem', padding: '7px 14px' }}
            title="Toggle CrimeVision AI Investigator Assistant"
          >
            <MessageSquare size={16} />
            <span>AI Investigator</span>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: chatOpen ? 'var(--accent-cyan)' : '#64748b',
            }}></span>
          </button>
        </div>
      </div>
    </header>
  );
}
