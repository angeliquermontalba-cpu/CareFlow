import { useState } from 'react';
import { NURSING_WORKFLOWS } from '../data/workflows.js';
import { callClaude } from '../data/storage.js';

function MicButton({ onTranscript }) {
  const [listening, setListening] = useState(false);
  const toggle = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Speech recognition not supported. Please use Chrome.'); return;
    }
    if (listening) { window._sr?.stop(); setListening(false); return; }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const r = new SR();
    r.continuous = true; r.interimResults = false; r.lang = 'en-AU';
    r.onresult = e => {
      const t = Array.from(e.results).map(x => x[0].transcript).join(' ');
      onTranscript(prev => prev ? prev + ' ' + t : t);
    };
    r.onend = () => setListening(false);
    r.onerror = () => setListening(false);
    r.start(); window._sr = r; setListening(true);
  };
  return (
    <button onClick={toggle} style={{
      padding: '6px 10px', borderRadius: 4, border: `1px solid ${listening ? '#ef4444' : 'var(--border2)'}`,
      background: listening ? '#450a0a' : 'var(--bg3)', color: listening ? '#fca5a5' : 'var(--text3)',
      cursor: 'pointer', fontSize: 12, flexShrink: 0, animation: listening ? 'pulse 1.2s infinite' : 'none',
    }}>
      {listening ? '⏹ Stop' : '🎙 Speak'}
    </button>
  );
}

export default function NursingPanel({ task, onUpdate, onRemove }) {
  const [expanded, setExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState('checklist');
  const [report, setReport] = useState(task.report || '');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const wf = NURSING_WORKFLOWS[task.type];
  const completed = wf.steps.filter(s => task.checklist?.[s.id]).length;
  const total = wf.steps.length;
  const pct = total ? Math.round((completed / total) * 100) : 0;

  const toggleStep = id => onUpdate({ ...task, checklist: { ...task.checklist, [id]: !task.checklist?.[id] } });
  const setNotes = updater => onUpdate({ ...task, rawNotes: typeof updater === 'function' ? updater(task.rawNotes || '') : updater });

  const generate = async () => {
    if (!task.rawNotes?.trim()) return;
    setLoading(true);
    try {
      const text = await callClaude(
        `You are a clinical documentation assistant for an aged care nurse. ${wf.reportPrompt}`,
        `Resident: ${task.residentName}\n\nNotes:\n${task.rawNotes}`
      );
      setReport(text); onUpdate({ ...task, report: text });
    } catch (e) { setReport(`Error: ${e.message}`); }
    setLoading(false);
  };

  return (
    <div style={{ marginTop: 10, background: 'var(--bg2)', border: `1px solid ${wf.color}44`, borderRadius: 6, overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }} onClick={() => setExpanded(e => !e)}>
        <span style={{ fontSize: 10, color: wf.color, fontWeight: 600, whiteSpace: 'nowrap' }}>{wf.label}</span>
        <span style={{ fontSize: 9, color: 'var(--text4)', padding: '1px 5px', border: `1px solid ${wf.color}44`, borderRadius: 3 }}>{wf.frequency}</span>
        <div style={{ flex: 1, height: 3, background: '#0f1e35', borderRadius: 2, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${pct}%`, background: `linear-gradient(90deg, ${wf.color}, var(--green))`, borderRadius: 2, transition: 'width 0.3s' }} />
        </div>
        <span style={{ fontSize: 10, color: 'var(--text3)', whiteSpace: 'nowrap' }}>{completed}/{total}</span>
        <span style={{ fontSize: 10, color: 'var(--text4)' }}>{expanded ? '▲' : '▼'}</span>
        <span style={{ fontSize: 10, color: 'var(--text4)', padding: '0 2px' }}
          onClick={e => { e.stopPropagation(); if (window.confirm('Remove this task?')) onRemove(); }}>✕</span>
      </div>

      {/* Expanded */}
      {expanded && (
        <div style={{ borderTop: `1px solid ${wf.color}22`, padding: '10px 12px' }}>
          <div style={{ display: 'flex', border: '1px solid var(--border)', borderRadius: 4, overflow: 'hidden', marginBottom: 10 }}>
            {[['checklist', `✓ Steps (${completed}/${total})`], ['note', '✎ Note']].map(([key, label]) => (
              <button key={key} onClick={() => setActiveTab(key)} style={{ flex: 1, padding: '7px', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: 10, background: activeTab === key ? '#1a0f2e' : 'transparent', color: activeTab === key ? wf.color : 'var(--text3)', borderRight: key === 'checklist' ? '1px solid var(--border)' : 'none', transition: 'all 0.15s' }}>
                {label}
              </button>
            ))}
          </div>

          {activeTab === 'checklist' && (
            <div>
              {wf.steps.map(step => (
                <div key={step.id} onClick={() => toggleStep(step.id)} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '8px 10px', marginBottom: 4, background: task.checklist?.[step.id] ? 'var(--green-dim)' : 'var(--bg3)', border: `1px solid ${task.checklist?.[step.id] ? 'var(--green-border)' : 'var(--border)'}`, borderRadius: 5, cursor: 'pointer', transition: 'all 0.12s' }}>
                  <div style={{ fontSize: 14, color: task.checklist?.[step.id] ? 'var(--green)' : 'var(--border2)', flexShrink: 0, marginTop: 1 }}>
                    {task.checklist?.[step.id] ? '✓' : '○'}
                  </div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: task.checklist?.[step.id] ? '#4ade80' : 'var(--text)', textDecoration: task.checklist?.[step.id] ? 'line-through' : 'none', marginBottom: 1 }}>{step.label}</div>
                    <div style={{ fontSize: 10, color: 'var(--text3)', lineHeight: 1.4 }}>{step.detail}</div>
                  </div>
                </div>
              ))}
              {completed === total && (
                <div style={{ marginTop: 8, fontSize: 11, color: 'var(--green)', textAlign: 'center' }}>✓ {wf.label} complete</div>
              )}
            </div>
          )}

          {activeTab === 'note' && (
            <div>
              <div className="label" style={{ marginBottom: 5 }}>RAW NOTES</div>
              <textarea className="input" rows={5} placeholder="Type or speak your notes..." value={task.rawNotes || ''} onChange={e => setNotes(e.target.value)} style={{ width: '100%', fontSize: 12, marginBottom: 6 }} />
              <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
                <MicButton onTranscript={setNotes} />
                <button className="btn btn-primary" style={{ fontSize: 11, padding: '6px 14px' }} onClick={generate} disabled={loading || !task.rawNotes?.trim()}>{loading ? 'Writing...' : '▶ Generate Note'}</button>
                {report && <button className={`btn-ghost ${copied ? 'success' : ''}`} style={{ fontSize: 11 }} onClick={() => { navigator.clipboard.writeText(report); setCopied(true); setTimeout(() => setCopied(false), 2000); }}>{copied ? '✓ Copied!' : '⎘ Copy'}</button>}
              </div>
              {loading && <div style={{ color: 'var(--text4)', fontSize: 11, marginBottom: 8 }}>⏳ Writing your note...</div>}
              {report && <><div className="label" style={{ marginBottom: 4 }}>FORMATTED NOTE</div><div className="report-box" style={{ fontSize: 11 }}>{report}</div></>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
