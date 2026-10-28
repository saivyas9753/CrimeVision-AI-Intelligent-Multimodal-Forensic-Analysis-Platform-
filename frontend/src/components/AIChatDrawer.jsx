import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Bot, 
  User, 
  Trash2, 
  X, 
  Sparkles, 
  FileSearch, 
  CornerDownRight, 
  Loader2 
} from 'lucide-react';
import { queryAIChat } from '../services/api';

export default function AIChatDrawer({ isOpen, onClose, currentCase, onSelectEvidence }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `### CrimeVision AI Forensic Assistant Active
I have ingested all multimodal telemetry for **Case ${currentCase?.case_number}**:
- **${currentCase?.evidence?.length || 0} Evidence Streams** (Visual + Acoustic + Dispatch)
- **${currentCase?.timeline?.length || 0} Chronological Events**
- **${currentCase?.scene_markers?.length || 0} Spatial Scene Markers**

Ask me any investigative query, cross-examine witness transcripts against CCTV, or request ballistic assessments.`,
      citations: [],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (queryText) => {
    const text = queryText || input;
    if (!text.trim() || !currentCase || loading) return;

    const userMsg = {
      role: 'user',
      content: text,
      citations: [],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await queryAIChat(currentCase.id, text, messages);
      const assistantMsg = {
        role: 'assistant',
        content: response.content || 'Analysis complete.',
        citations: response.citations || [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: '⚠️ **CrimeVision AI Query Exception**: Could not connect to forensic intelligence backend. Please verify that the backend server is running.',
          citations: [],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const suggestedQueries = [
    "What weapon was detected and what are its specifications?",
    "Does the 911 witness statement match the visual timeline?",
    "Summarize suspect movements and escape route trajectory.",
    "Show chronological event reconstruction."
  ];

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      right: 0,
      bottom: 0,
      width: '450px',
      maxWidth: '92vw',
      background: 'rgba(8, 12, 22, 0.96)',
      borderLeft: '1px solid var(--border-focus)',
      boxShadow: '-10px 0 40px rgba(0, 0, 0, 0.8), var(--shadow-glow)',
      backdropFilter: 'blur(20px)',
      zIndex: 200,
      display: 'flex',
      flexDirection: 'column',
      animation: 'slideIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
    }}>
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>

      {/* Header */}
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'rgba(12, 18, 34, 0.9)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.2), rgba(99, 102, 241, 0.3))',
            border: '1px solid var(--accent-cyan)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Bot size={18} color="#00f0ff" />
          </div>
          <div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff' }}>
              Forensic AI Assistant
            </h3>
            <span style={{ fontSize: '0.7rem', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span className="pulse-cyan" style={{ width: '5px', height: '5px' }}></span>
              Multimodal Cross-Examination
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            onClick={() => setMessages([messages[0]])}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '6px' }}
            title="Clear Chat History"
          >
            <Trash2 size={16} />
          </button>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#ffffff', cursor: 'pointer', padding: '6px' }}
            title="Close Assistant"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}>
        {messages.map((msg, idx) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={idx}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: isUser ? 'flex-end' : 'flex-start',
                gap: '4px',
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.68rem',
                color: 'var(--text-muted)',
                marginBottom: '2px',
              }}>
                {isUser ? <User size={12} /> : <Bot size={12} color="var(--accent-cyan)" />}
                <span>{isUser ? 'Investigator' : 'CrimeVision Agent'}</span>
                <span>&bull;</span>
                <span>{msg.timestamp}</span>
              </div>

              {/* Message Bubble */}
              <div style={{
                maxWidth: '92%',
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                background: isUser ? 'linear-gradient(135deg, #0284c7, #0369a1)' : 'rgba(16, 24, 44, 0.85)',
                border: isUser ? '1px solid rgba(56, 189, 248, 0.4)' : '1px solid var(--border-subtle)',
                color: '#ffffff',
                fontSize: '0.82rem',
                lineHeight: 1.5,
                whiteSpace: 'pre-wrap',
                boxShadow: isUser ? '0 2px 10px rgba(2, 132, 199, 0.25)' : '0 2px 10px rgba(0,0,0,0.4)',
              }}>
                {msg.content}

                {/* Evidence Citations Chips */}
                {msg.citations && msg.citations.length > 0 && (
                  <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    <span style={{ fontSize: '0.68rem', color: 'var(--accent-cyan)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                      EVIDENCE CITATIONS:
                    </span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {msg.citations.map((c, cIdx) => (
                        <button
                          key={cIdx}
                          onClick={() => {
                            if (c.evidence_id && onSelectEvidence) {
                              onSelectEvidence(c.evidence_id);
                            }
                          }}
                          style={{
                            background: 'rgba(0, 240, 255, 0.15)',
                            border: '1px solid rgba(0, 240, 255, 0.3)',
                            borderRadius: '3px',
                            color: 'var(--accent-cyan)',
                            fontSize: '0.68rem',
                            padding: '2px 6px',
                            cursor: 'pointer',
                            fontFamily: 'var(--font-mono)',
                          }}
                        >
                          [{c.evidence_id}] {c.title?.split(':')[0]} &rarr;
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-cyan)', fontSize: '0.8rem', padding: '10px' }}>
            <Loader2 size={16} className="animate-spin" />
            <span>Analyzing multimodal evidence tensors...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions Chips */}
      <div style={{
        padding: '10px 16px',
        borderTop: '1px solid var(--border-subtle)',
        background: 'rgba(10, 15, 28, 0.95)',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
      }}>
        <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Suggested Forensic Queries:
        </span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
          {suggestedQueries.map((q, qIdx) => (
            <button
              key={qIdx}
              onClick={() => handleSend(q)}
              disabled={loading}
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '4px',
                color: 'var(--text-secondary)',
                fontSize: '0.72rem',
                padding: '4px 8px',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--accent-cyan)';
                e.currentTarget.style.color = '#ffffff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-subtle)';
                e.currentTarget.style.color = 'var(--text-secondary)';
              }}
            >
              &bull; {q}
            </button>
          ))}
        </div>
      </div>

      {/* Input Box */}
      <div style={{
        padding: '12px 16px',
        borderTop: '1px solid var(--border-subtle)',
        background: 'rgba(6, 9, 16, 0.98)',
      }}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          style={{ display: 'flex', gap: '8px' }}
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask AI Investigator about weapons, timeline, statements..."
            disabled={loading}
            style={{
              flex: 1,
              background: 'rgba(16, 24, 44, 0.8)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              padding: '8px 12px',
              color: '#ffffff',
              fontSize: '0.82rem',
              outline: 'none',
              fontFamily: 'var(--font-sans)',
            }}
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="btn btn-primary"
            style={{ padding: '8px 14px' }}
          >
            <Send size={15} />
          </button>
        </form>
      </div>
    </div>
  );
}
