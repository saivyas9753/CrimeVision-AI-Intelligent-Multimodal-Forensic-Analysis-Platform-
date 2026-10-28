import React, { useState } from 'react';
import { 
  FileText, 
  X, 
  Download, 
  ShieldCheck, 
  CheckSquare, 
  Loader2, 
  Lock 
} from 'lucide-react';
import { downloadReportPdf } from '../services/api';

export default function ReportModal({ isOpen, onClose, currentCase }) {
  const [notes, setNotes] = useState('');
  const [generating, setGenerating] = useState(false);

  if (!isOpen || !currentCase) return null;

  const handleDownload = async () => {
    setGenerating(true);
    try {
      await downloadReportPdf(currentCase.id, notes);
      onClose();
    } catch (err) {
      console.error(err);
      alert('Failed to generate report. Please verify backend connection.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '640px', padding: '24px' }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: 'rgba(2, 132, 199, 0.2)',
              border: '1px solid #0284c7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <FileText size={20} color="#38bdf8" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', color: '#ffffff', fontWeight: 700 }}>
                Forensic Examination Dossier (PDF)
              </h3>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Court-Admissible Multimodal Intelligence Report
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Dossier Preview Summary Box */}
        <div style={{
          background: 'rgba(16, 24, 44, 0.7)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-sm)',
          padding: '16px',
          marginBottom: '16px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', paddingBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#ffffff' }}>
              {currentCase.title}
            </span>
            <span className="font-mono badge badge-cyan">
              {currentCase.case_number}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
            <div>&bull; <b>Lead Investigator:</b> {currentCase.lead_investigator}</div>
            <div>&bull; <b>Threat Level:</b> <span style={{ color: '#ff3366' }}>{currentCase.threat_level}</span></div>
            <div>&bull; <b>Evidence Items:</b> {currentCase.evidence?.length || 0} cataloged (SHA-256)</div>
            <div>&bull; <b>Timeline Milestones:</b> {currentCase.timeline?.length || 0} synchronized</div>
          </div>

          <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981', fontSize: '0.72rem' }}>
            <ShieldCheck size={14} />
            <span>Digital Chain of Custody & Cryptographic Verification Table Included</span>
          </div>
        </div>

        {/* Investigator Notes / Addendum */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '5px' }}>
            Investigator Addendum & Evidentiary Conclusions:
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Add specific courtroom findings, warrant references, or ballistic notes..."
            style={{
              width: '100%',
              background: 'rgba(16, 24, 44, 0.8)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              padding: '10px',
              color: '#ffffff',
              fontSize: '0.8rem',
              resize: 'vertical',
              fontFamily: 'var(--font-sans)',
            }}
          />
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button
            onClick={onClose}
            className="btn btn-outline"
            disabled={generating}
          >
            Cancel
          </button>
          <button
            onClick={handleDownload}
            className="btn btn-primary"
            disabled={generating}
            style={{ minWidth: '160px' }}
          >
            {generating ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Compiling Dossier...</span>
              </>
            ) : (
              <>
                <Download size={16} />
                <span>Download PDF Dossier</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
