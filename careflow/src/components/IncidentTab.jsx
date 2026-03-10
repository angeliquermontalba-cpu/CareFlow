import { useState } from 'react';
import { INCIDENT_WORKFLOWS } from '../data/workflows.js';
import { callClaude, getNow, getDate } from '../data/storage.js';

function IncidentDetail({ incident, onBack }) {
  const [copied, setCopied] = useState(false);
  const wf = INCIDENT_WORKFLOWS[incident.type];
  const copy = () => { navigator.clipboard.writeText(incident.report || ''); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  return (
    <div style={{ padding: '16px 24px 60px' }} className="fade-in">
      <button className="btn-ghost" style={{ marginBottom: 16 }} onClick={onBack}>← Back to Incidents</button>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, marginBottom: 4 }}>{incident.resident}</div>
      <div style={{ fontSize: 10, color: 'var(--text3)', marginBottom: 20 }}>{wf?.label} · {incident.date} {incident.time}</div>

      {wf && (
        <div style={{ marginBottom: 20 }}>
          <div className="label" style={{ marginBottom: 8 }}>CHECKLIST ({incident.completedSteps}/{incident.totalSteps} completed)</div>
          {wf.steps.map(s => (
            <div key={s.id} style={{ display: 'flex', gap: 8, padding: '6px 0', borderBottom: '1px solid #0f1e35', fontSize: 12, color: incident.checklist?.[s.id] ? 'var(--green)' : 'var(--text3)' }}>
              <span>{incident.checklist?.[s.id] ? '✓' : '○'}</span> {s.label}
            </div>
          ))}
        </div>
      )}

      {incident.report && (
        <div>
          <div className="label" style={{ marginBottom: 8 }}>PROGRESS NOTE</div>
          <div className="report-box" style={{ marginBottom: 12 }}>{incident.report}</div>
          <button className={`btn-ghost ${copied ? 'success' : ''}`} onClick={copy}>{copied ? '✓ Copied!' : '⎘ Copy Note'}</button>
        </div>
      )}
    </div>
  );
}

export default function IncidentTab({ savedIncidents, setSavedIncidents }) {
  const [selected, setSelected] = useState(null);
  const [residentName, setResidentName] = useState('');
  const [checklist, setChecklist] = useState({});
  const [rawNotes, setRawNotes] = useState('');
  const [report, setReport] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeSection, setActiveSection] = useState('checklist');
  const [viewingId, setViewingId] = useState(null);

  const viewing = viewingId !== null ? savedIncidents.find(x => x.id === viewingId) : null;
  if (viewing) return <IncidentDetail incident={viewing} onBack={() => setViewingId(null)} />;

  const workflow = selected ? INCIDENT_WORKFLOWS[selected] : null;
  const completedSteps = workflow ? workflow.steps.filter(s => checklist[s.id]).length : 0;
  const totalSteps = workflow ? workflow.steps.length : 0;
  const stepPct = totalSteps ? Math.round((completedSteps / totalSteps) * 100) : 0;

  const selectType = key => { setSelected(key); setChecklist({}); setReport(''); setRawNotes(''); setActiveSection('checklist'); };
  const toggleStep = id => setChecklist(c => ({ ...c, [id]: !c[id] }));

  const generate = async () => {
    if (!rawNotes.trim()) return;
    setLoading(true); setReport('');
    try {
      const text = await callClaude(
        `You are a clinical documentation assistant for an aged care nurse. ${workflow.reportPrompt}`,
        `Resident: ${residentName || '[Resident]'}\n\nNotes:\n${rawNotes}`
      );
      setReport(text);
      const saved = { id: Date.now(), resident: residentName || 'Unknown', type: selected, typeLabel: workflow.label, date: getDate(), time: getNow(), checklist, rawNotes, report: text, completedSteps, totalSteps };
      setSavedIncidents(prev => [saved, ...prev].slice(0, 50));
    } catch (e) { setReport(`Error: ${e.message}`); }
    setLoading(false);
  };

  return (
    <div style={{ padding: '16px 24px 60px' }}>
      <div className="page-title-label">STANDARDISED WORKFLOWS</div>
      <div className="page-title" style={{ marginBottom: 4 }}>Incident Management</div>
      <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 20 }}>Select incident type to begin the standardised workflow</div>

      {/* Type buttons */}
      <div className="label" style={{ marginBottom: 8 }}>INCIDENT TYPE</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 20 }}>
        {Object.entries(INCIDENT_WORKFLOWS).map(([key, wf]) => (
          <button key={key} className="btn-ghost" style={selected === key ? { borderColor: wf.color, color: wf.color, background: wf.color + '18' } : {}} onClick={() => selectType(key)}>
            {wf.label}
          </button>
        ))}
      </div>

      {!selected && (
        <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text4)', fontSize: 12 }}>Select an incident type above to load the workflow</div>
      )}

      {selected && workflow && (
        <div className="fade-in">
          <div className="label">RESIDENT NAME</div>
          <input className="input" placeholder="e.g. Wayne Trevethick" value={residentName} onChange={e => setResidentName(e.target.value)} style={{ width: '100%', marginBottom: 16 }} />

          {/* Toggle */}
          <div style={{ display: 'flex', border: '1px solid var(--border)', borderRadius: 5, overflow: 'hidden', marginBottom: 16 }}>
            {[['checklist', `✓ Checklist (${completedSteps}/${totalSteps})`], ['note', '✎ Progress Note']].map(([key, label]) => (
              <button key={key} onClick={() => setActiveSection(key)} style={{ flex: 1, padding: '9px', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: 11, background: activeSection === key ? 'var(--blue-dim)' : 'transparent', color: activeSection === key ? 'var(--blue2)' : 'var(--text3)', borderRight: key === 'checklist' ? '1px solid var(--border)' : 'none', transition: 'all 0.15s' }}>
                {label}
              </button>
            ))}
          </div>

          {/* CHECKLIST */}
          {activeSection === 'checklist' && (
            <div className="fade-in">
              <div className="progress-track" style={{ marginBottom: 14 }}>
                <div className="progress-fill" style={{ width: `${stepPct}%`, background: `linear-gradient(90deg, ${workflow.color}, var(--green))` }} />
              </div>
              {workflow.steps.map(step => (
                <div key={step.id} onClick={() => toggleStep(step.id)} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '11px 13px', marginBottom: 5, background: checklist[step.id] ? 'var(--green-dim)' : 'var(--bg3)', border: `1px solid ${checklist[step.id] ? 'var(--green-border)' : 'var(--border)'}`, borderRadius: 6, cursor: 'pointer', transition: 'all 0.15s' }}>
                  <div style={{ fontSize: 16, color: checklist[step.id] ? 'var(--green)' : 'var(--border2)', flexShrink: 0, marginTop: 1 }}>{checklist[step.id] ? '✓' : '○'}</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: checklist[step.id] ? '#4ade80' : 'var(--text)', textDecoration: checklist[step.id] ? 'line-through' : 'none', marginBottom: 2 }}>{step.label}</div>
                    <div style={{ fontSize: 11, color: 'var(--text3)' }}>{step.detail}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* NOTE GENERATOR */}
          {activeSection === 'note' && (
            <div className="fade-in">
              <div className="label" style={{ marginBottom: 6 }}>YOUR RAW NOTES</div>
              <textarea className="input" rows={9} placeholder="Type or paste your notes freely — messy, shorthand, incomplete — I'll format them into your clinical style..." value={rawNotes} onChange={e => setRawNotes(e.target.value)} style={{ width: '100%' }} />
              <div style={{ display: 'flex', gap: 8, margin: '12px 0' }}>
                <button className="btn btn-primary" onClick={generate} disabled={loading || !rawNotes.trim()}>{loading ? 'Generating...' : '▶ Generate Note'}</button>
                {report && <button className={`btn-ghost ${copied ? 'success' : ''}`} onClick={() => { navigator.clipboard.writeText(report); setCopied(true); setTimeout(() => setCopied(false), 2000); }}>{copied ? '✓ Copied!' : '⎘ Copy'}</button>}
                {report && <button className="btn-ghost" onClick={() => { setReport(''); setRawNotes(''); }}>✕ Clear</button>}
              </div>
              {loading && <div style={{ color: 'var(--text4)', fontSize: 12, marginBottom: 12 }}>⏳ Writing your note...</div>}
              {report && (
                <div className="fade-in">
                  <div className="label" style={{ marginBottom: 6 }}>FORMATTED PROGRESS NOTE</div>
                  <div className="report-box">{report}</div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Saved */}
      {savedIncidents.length > 0 && (
        <div style={{ marginTop: 32 }}>
          <div className="label" style={{ marginBottom: 10 }}>SAVED INCIDENTS ({savedIncidents.length})</div>
          {savedIncidents.map(inc => {
            const wf = INCIDENT_WORKFLOWS[inc.type];
            return (
              <div key={inc.id} className="card" style={{ padding: '11px 14px', cursor: 'pointer', marginBottom: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} onClick={() => setViewingId(inc.id)}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 600 }}>{inc.resident}</span>
                    <span style={{ fontSize: 10, padding: '1px 7px', borderRadius: 3, background: (wf?.color || '#888') + '20', border: `1px solid ${(wf?.color || '#888')}44`, color: wf?.color || '#888' }}>{wf?.label || inc.type}</span>
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 3 }}>{inc.date} {inc.time} · {inc.completedSteps}/{inc.totalSteps} steps</div>
                </div>
                <span style={{ fontSize: 11, color: 'var(--text4)' }}>View →</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
