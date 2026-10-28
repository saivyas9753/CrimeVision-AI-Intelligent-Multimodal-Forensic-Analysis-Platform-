import React, { useState } from 'react';
import { 
  UploadCloud, 
  X, 
  FileCheck, 
  Loader2, 
  Camera, 
  Mic, 
  Video, 
  ShieldCheck, 
  AlertCircle 
} from 'lucide-react';
import { uploadEvidenceFile } from '../services/api';

export default function EvidenceUploadModal({ isOpen, onClose, currentCase, onEvidenceUploaded }) {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [source, setSource] = useState('Storefront Surveillance Cam');
  const [evidenceType, setEvidenceType] = useState('image');
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setTitle(selected.name.replace(/\.[^/.]+$/, "").replace(/_/g, " "));
      
      const ext = selected.name.split('.').pop().toLowerCase();
      if (['jpg', 'jpeg', 'png', 'webp'].includes(ext)) {
        setEvidenceType('image');
      } else if (['wav', 'mp3', 'm4a', 'ogg'].includes(ext)) {
        setEvidenceType('audio');
      } else if (['mp4', 'mov', 'avi'].includes(ext)) {
        setEvidenceType('video');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !currentCase) return;

    setUploading(true);
    setError(null);
    setResult(null);

    try {
      const res = await uploadEvidenceFile(
        currentCase.id,
        file,
        title || 'New Evidence Item',
        source || 'Field Forensic Sensor',
        evidenceType
      );
      setResult(res);
      if (onEvidenceUploaded) {
        onEvidenceUploaded(res.case);
      }
    } catch (err) {
      console.error(err);
      setError('Evidence ingestion failed. Please verify the backend connection and try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '600px', padding: '24px' }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: 'rgba(0, 240, 255, 0.15)',
              border: '1px solid var(--accent-cyan)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <UploadCloud size={20} color="var(--accent-cyan)" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', color: '#ffffff', fontWeight: 700 }}>
                Multimodal Evidence Ingestion
              </h3>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Case: {currentCase?.case_number} &bull; SHA-256 Verification & AI Detection
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

        {/* Success View */}
        {result ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: 'var(--radius-sm)',
              padding: '16px',
              textAlign: 'center',
            }}>
              <ShieldCheck size={36} color="#10b981" style={{ margin: '0 auto 8px' }} />
              <h4 style={{ color: '#ffffff', marginBottom: '4px' }}>Evidence Ingested & Cryptographically Verified</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                Item <b>[{result.evidence?.id}]</b> added to case with {result.evidence?.detections?.length || 0} detections and synchronized to the chronological timeline.
              </p>
            </div>

            <div style={{
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              padding: '12px',
              fontSize: '0.75rem',
            }}>
              <div style={{ marginBottom: '6px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Digital Digest: </span>
                <span className="font-mono" style={{ color: '#38bdf8' }}>{result.evidence?.sha256}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Milestone: </span>
                <span style={{ color: '#ffffff' }}>{result.timeline_event?.title}</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => {
                  setResult(null);
                  setFile(null);
                  setTitle('');
                }}
                className="btn btn-outline"
              >
                Upload Another
              </button>
              <button
                onClick={onClose}
                className="btn btn-primary"
              >
                Close & Inspect
              </button>
            </div>
          </div>
        ) : (
          /* Upload Form */
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* File Dropzone */}
            <div style={{
              border: '2px dashed var(--border-focus)',
              borderRadius: 'var(--radius-md)',
              padding: '30px',
              textAlign: 'center',
              background: 'rgba(0, 240, 255, 0.02)',
              cursor: 'pointer',
              position: 'relative',
            }}>
              <input
                type="file"
                onChange={handleFileChange}
                accept="image/*,audio/*,video/*"
                required
                style={{
                  position: 'absolute',
                  inset: 0,
                  opacity: 0,
                  cursor: 'pointer',
                  width: '100%',
                  height: '100%',
                }}
              />
              <UploadCloud size={36} color="var(--accent-cyan)" style={{ margin: '0 auto 10px' }} />
              {file ? (
                <div>
                  <p style={{ color: '#ffffff', fontWeight: 600, fontSize: '0.9rem' }}>{file.name}</p>
                  <p style={{ color: 'var(--accent-cyan)', fontSize: '0.75rem' }}>
                    {(file.size / 1024 / 1024).toFixed(2)} MB &bull; Ready for Multimodal Analysis
                  </p>
                </div>
              ) : (
                <div>
                  <p style={{ color: '#ffffff', fontWeight: 600, fontSize: '0.9rem', marginBottom: '4px' }}>
                    Click or drag surveillance image, 911 audio, or video clip
                  </p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                    Supports JPG, PNG, MP4, WAV, MP3 with automatic EXIF/audio parsing
                  </p>
                </div>
              )}
            </div>

            {/* Title */}
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '5px' }}>
                Evidence Title / Description:
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. CCTV Cam-03 Side Corridor Entry"
                required
                style={{
                  width: '100%',
                  background: 'rgba(16, 24, 44, 0.8)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '8px 12px',
                  color: '#ffffff',
                  fontSize: '0.82rem',
                }}
              />
            </div>

            {/* Source Sensor */}
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '5px' }}>
                Source Sensor / Ingestion Channel:
              </label>
              <input
                type="text"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                placeholder="e.g. 4K HikVision PTZ Dome #12"
                style={{
                  width: '100%',
                  background: 'rgba(16, 24, 44, 0.8)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '8px 12px',
                  color: '#ffffff',
                  fontSize: '0.82rem',
                }}
              />
            </div>

            {error && (
              <div style={{ color: '#ff3366', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <AlertCircle size={14} />
                <span>{error}</span>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
              <button
                type="button"
                onClick={onClose}
                className="btn btn-outline"
                disabled={uploading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={!file || uploading}
                style={{ minWidth: '140px' }}
              >
                {uploading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Processing AI...</span>
                  </>
                ) : (
                  <>
                    <UploadCloud size={16} />
                    <span>Run AI Analysis</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
