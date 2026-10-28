import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import EvidenceViewer from './components/EvidenceViewer';
import AudioAnalyzer from './components/AudioAnalyzer';
import TimelineView from './components/TimelineView';
import SceneMap from './components/SceneMap';
import AIChatDrawer from './components/AIChatDrawer';
import EvidenceUploadModal from './components/EvidenceUploadModal';
import ReportModal from './components/ReportModal';
import { fetchCases, fetchCase, fetchHealth } from './services/api';
import { 
  Eye, 
  Clock, 
  Compass, 
  Activity, 
  MapPin, 
  Calendar, 
  UserCheck, 
  AlertTriangle,
  Layers,
  ChevronRight
} from 'lucide-react';

export default function App() {
  const [cases, setCases] = useState([]);
  const [currentCaseId, setCurrentCaseId] = useState('CV-2026-0892');
  const [currentCase, setCurrentCase] = useState(null);
  const [activeEvidenceId, setActiveEvidenceId] = useState(null);
  const [activeTab, setActiveTab] = useState('multimodal'); // multimodal, timeline, scenemap, acoustic
  const [chatOpen, setChatOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initial load
  useEffect(() => {
    async function init() {
      try {
        const [casesData, healthData] = await Promise.all([
          fetchCases(),
          fetchHealth().catch(() => null)
        ]);
        setCases(casesData);
        setHealth(healthData);
        if (casesData.length > 0) {
          loadCase(casesData[0].id);
        }
      } catch (err) {
        console.error('Failed to initialize CrimeVision:', err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  const loadCase = async (caseId) => {
    try {
      const caseData = await fetchCase(caseId);
      setCurrentCase(caseData);
      setCurrentCaseId(caseId);
      if (caseData.evidence && caseData.evidence.length > 0) {
        setActiveEvidenceId(caseData.evidence[0].id);
      }
    } catch (err) {
      console.error('Failed to load case:', err);
    }
  };

  const handleSelectCase = (caseId) => {
    loadCase(caseId);
  };

  const handleEvidenceUploaded = (updatedCase) => {
    setCurrentCase(updatedCase);
    if (updatedCase.evidence && updatedCase.evidence.length > 0) {
      setActiveEvidenceId(updatedCase.evidence[updatedCase.evidence.length - 1].id);
    }
  };

  // Find audio evidence if any
  const audioEvidence = currentCase?.evidence?.find((e) => e.type === 'audio') || null;

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: '#06090f',
        color: 'var(--accent-cyan)',
        gap: '16px'
      }}>
        <div className="pulse-cyan" style={{ width: '24px', height: '24px' }}></div>
        <h2 className="font-display" style={{ letterSpacing: '0.05em' }}>CRIMEVISION AI</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          Initializing Multimodal Forensic Neural Pipeline...
        </p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-deep)' }}>
      {/* Tactical Header */}
      <Header
        cases={cases}
        currentCase={currentCase}
        onSelectCase={handleSelectCase}
        onOpenUpload={() => setUploadModalOpen(true)}
        onOpenReport={() => setReportModalOpen(true)}
        onToggleChat={() => setChatOpen(!chatOpen)}
        chatOpen={chatOpen}
        health={health}
      />

      {/* Main Workspace Container */}
      <main style={{ flex: 1, padding: '16px 24px', maxWidth: '1920px', margin: '0 auto', width: '100%' }}>
        {/* Case Incident Briefing Card */}
        {currentCase && (
          <div className="tactical-panel" style={{ padding: '14px 20px', marginBottom: '16px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '14px',
              borderBottom: '1px solid var(--border-subtle)',
              paddingBottom: '12px',
              marginBottom: '12px',
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span className="badge badge-cyan">{currentCase.case_number}</span>
                  <span className="badge badge-warning">{currentCase.status}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Jurisdiction: {currentCase.jurisdiction}
                  </span>
                </div>
                <h2 style={{ fontSize: '1.25rem', color: '#ffffff', fontWeight: 700 }}>
                  {currentCase.title}
                </h2>
              </div>

              {/* Quick Meta Badges */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MapPin size={15} color="var(--accent-cyan)" />
                  <span>{currentCase.incident_location}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Calendar size={15} color="var(--accent-blue)" />
                  <span>{currentCase.incident_date}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <UserCheck size={15} color="#10b981" />
                  <span>{currentCase.lead_investigator}</span>
                </div>
              </div>
            </div>

            {/* Incident Summary & Navigation Tabs */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
            }}>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', maxWidth: '900px', lineHeight: 1.45 }}>
                {currentCase.summary}
              </p>

              {/* View Switcher Tabs */}
              <div style={{ display: 'flex', gap: '6px', background: 'rgba(255,255,255,0.03)', padding: '3px', borderRadius: 'var(--radius-sm)' }}>
                {[
                  { id: 'multimodal', label: 'Evidence & Bounding Boxes', icon: Eye },
                  { id: 'timeline', label: 'Chronological Timeline', icon: Clock },
                  { id: 'scenemap', label: '2D Scene Blueprint', icon: Compass },
                  { id: 'acoustic', label: 'Acoustic Console', icon: Activity },
                ].map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 12px',
                        border: 'none',
                        borderRadius: '4px',
                        background: isActive ? 'var(--accent-cyan)' : 'transparent',
                        color: isActive ? '#000000' : 'var(--text-secondary)',
                        fontWeight: 700,
                        fontSize: '0.78rem',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <tab.icon size={13} />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Tab-driven Main Work Area */}
        {activeTab === 'multimodal' && (
          <div className="responsive-grid-main">
            {/* Left: Evidence Viewer (Image Canvas + Bounding Boxes) */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <EvidenceViewer
                evidenceList={currentCase?.evidence || []}
                activeEvidenceId={activeEvidenceId}
                onSelectEvidence={(id) => setActiveEvidenceId(id)}
              />
            </div>

            {/* Right: Chronological Timeline + Acoustic Preview */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ flex: 1, minHeight: '340px' }}>
                <TimelineView
                  timeline={currentCase?.timeline || []}
                  onSelectEvidence={(id) => setActiveEvidenceId(id)}
                  activeEvidenceId={activeEvidenceId}
                />
              </div>

              {audioEvidence && (
                <div style={{ minHeight: '260px' }}>
                  <AudioAnalyzer audioEvidence={audioEvidence} />
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'timeline' && (
          <div className="responsive-grid-split">
            <TimelineView
              timeline={currentCase?.timeline || []}
              onSelectEvidence={(id) => setActiveEvidenceId(id)}
              activeEvidenceId={activeEvidenceId}
            />
            <EvidenceViewer
              evidenceList={currentCase?.evidence || []}
              activeEvidenceId={activeEvidenceId}
              onSelectEvidence={(id) => setActiveEvidenceId(id)}
            />
          </div>
        )}

        {activeTab === 'scenemap' && (
          <div className="responsive-grid-blueprint">
            <SceneMap
              sceneMarkers={currentCase?.scene_markers || []}
              caseTitle={currentCase?.title}
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="tactical-panel" style={{ padding: '16px' }}>
                <h4 style={{ fontSize: '0.9rem', color: '#ffffff', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <AlertTriangle size={16} color="#f59e0b" />
                  <span>Forensic Investigative Hypotheses</span>
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {(currentCase?.forensic_hypotheses || []).map((hyp, hIdx) => (
                    <div
                      key={hIdx}
                      style={{
                        padding: '8px 10px',
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.75rem',
                        color: 'var(--text-secondary)',
                        lineHeight: 1.4,
                      }}
                    >
                      <span style={{ color: 'var(--accent-cyan)', fontWeight: 700 }}>LEAD #{hIdx + 1}: </span>
                      {hyp}
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ flex: 1 }}>
                <TimelineView
                  timeline={currentCase?.timeline || []}
                  onSelectEvidence={(id) => setActiveEvidenceId(id)}
                  activeEvidenceId={activeEvidenceId}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'acoustic' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <AudioAnalyzer audioEvidence={audioEvidence} />
            <TimelineView
              timeline={currentCase?.timeline || []}
              onSelectEvidence={(id) => setActiveEvidenceId(id)}
              activeEvidenceId={activeEvidenceId}
            />
          </div>
        )}
      </main>

      {/* Persistent AI Investigator Chat Drawer */}
      <AIChatDrawer
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
        currentCase={currentCase}
        onSelectEvidence={(id) => {
          setActiveEvidenceId(id);
          setActiveTab('multimodal');
        }}
      />

      {/* Evidence Upload Modal */}
      <EvidenceUploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        currentCase={currentCase}
        onEvidenceUploaded={handleEvidenceUploaded}
      />

      {/* Forensic Report Dossier Modal */}
      <ReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        currentCase={currentCase}
      />
    </div>
  );
}
