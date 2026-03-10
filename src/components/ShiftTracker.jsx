import { useState, useRef } from 'react';
import { SECTION_CONFIG, INCIDENT_WORKFLOWS, NURSING_WORKFLOWS } from '../data/workflows.js';
import NursingPanel from './NursingPanel.jsx';
import { getNow, getDate, callClaude } from '../data/storage.js';

// ── SPEECH HOOK ───────────────────────────────────────────────────
function useSpeech(onTranscript) {
  const recogRef = useRef(null);
  const [listening, setListening] = useState(false);
  const toggle = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Speech recognition not supported. Please use Chrome.'); return;
    }
    if (listening) { recogRef.current?.stop(); setListening(false); return; }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const r = new SR();
    r.continuous = true; r.interimResults = false; r.lang = 'en-AU';
    r.onresult = e => {
      const t = Array.from(e.results).map(x => x[0].transcript).join(' ');
      onTranscript(prev => prev ? prev + ' ' + t : t);
    };
    r.onend = () => setListening(false);
    r.onerror = () => setListening(false);
    r.start(); recogRef.current = r; setListening(true);
  };
  return { listening, toggle };
}

function MicButton({ onTranscript }) {
  const { listening, toggle } = useSpeech(onTranscript);
  return (
    <button onClick={toggle} title={listening ? 'Stop' : 'Speak notes'} style={{
      padding: '6px 10px', borderRadius: 4, border: `1px solid ${listening ? '#ef4444' : 'var(--border2)'}`,
      background: listening ? '#450a0a' : 'var(--bg3)', color: listening ? '#fca5a5' : 'var(--text3)',
      cursor: 'pointer', fontSize: 12, flexShrink: 0, animation: listening ? 'pulse 1.2s infinite' : 'none',
    }}>
      {listening ? '⏹ Stop' : '🎙 Speak'}
    </button>
  );
}

// ── FOLLOW-UP SECTION ─────────────────────────────────────────────
const GENERIC_FOLLOWUP = {
  label: 'General Nursing Follow-up',
  tasks: ['Progress note', 'Vital signs', 'Pain charting', 'General reassessment'],
};

function FollowUpSection({ followUp, followUpDismissed, followUpLabel, followUpTasks, onActivate, onToggle, onDismiss }) {
  if (!followUp && !followUpDismissed) {
    return (
      <div style={{ marginTop: 8, padding: '8px 12px', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 1 }}>📅 {followUpLabel}</div>
          <div style={{ fontSize: 10, color: 'var(--text4)' }}>{followUpTasks.join(' · ')}</div>
        </div>
        <div style={{ display: 'flex', gap: 5 }}>
          <button className="btn-ghost" style={{ fontSize: 10, padding: '3px 9px', borderColor: 'var(--blue)', color: 'var(--blue)' }} onClick={onActivate}>Activate Follow-up</button>
          <button className="btn-ghost" style={{ fontSize: 10, padding: '3px 7px' }} onClick={onDismiss}>✕</button>
        </div>
      </div>
    );
  }
  if (!followUp) return null;

  const done = followUp.completedTasks || [];
  const allDone = done.length === followUpTasks.length;
  return (
    <div style={{ marginTop: 8, padding: '10px 12px', background: allDone ? 'var(--green-dim)' : 'var(--bg2)', border: `1px solid ${allDone ? 'var(--green-border)' : 'var(--border2)'}`, borderRadius: 6 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: allDone ? 'var(--green)' : 'var(--blue2)', marginBottom: 8 }}>
        📅 {followUpLabel} {allDone && '✓'}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        {followUpTasks.map(task => {
          const isDone = done.includes(task);
          return (
            <span key={task} className={`chip ${isDone ? 'done' : ''}`} onClick={() => onToggle(task)}>
              {isDone ? '✓' : '○'} {task}
            </span>
          );
        })}
      </div>
      {allDone && <div style={{ fontSize: 10, color: 'var(--green)', marginTop: 6 }}>Follow-up complete ✓</div>}
    </div>
  );
}

// ── INCIDENT PANEL ────────────────────────────────────────────────
function IncidentPanel({ incident, onUpdate, onRemove }) {
  const [expanded, setExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState('checklist');
  const [report, setReport] = useState(incident.report || '');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const wf = INCIDENT_WORKFLOWS[incident.type];
  const completed = wf.steps.filter(s => incident.checklist?.[s.id]).length;
  const total = wf.steps.length;
  const pct = total ? Math.round((completed / total) * 100) : 0;
  const allStepsDone = completed === total;

  const toggleStep = id => onUpdate({ ...incident, checklist: { ...incident.checklist, [id]: !incident.checklist?.[id] } });
  const setNotes = updater => onUpdate({ ...incident, rawNotes: typeof updater === 'function' ? updater(incident.rawNotes || '') : updater });

  const generate = async () => {
    if (!incident.rawNotes?.trim()) return;
    setLoading(true);
    try {
      const text = await callClaude(
        `You are a clinical documentation assistant for an aged care nurse. ${wf.reportPrompt}`,
        `Resident: ${incident.residentName}\n\nNotes:\n${incident.rawNotes}`
      );
      setReport(text); onUpdate({ ...incident, report: text });
    } catch (e) { setReport(`Error: ${e.message}`); }
    setLoading(false);
  };

  const activateFollowUp = () => onUpdate({ ...incident, followUp: { completedTasks: [] }, followUpDismissed: false });
  const dismissFollowUp = () => onUpdate({ ...incident, followUpDismissed: true });
  const toggleFollowUpTask = task => {
    const curr = incident.followUp?.completedTasks || [];
    const updated = curr.includes(task) ? curr.filter(t => t !== task) : [...curr, task];
    onUpdate({ ...incident, followUp: { completedTasks: updated } });
  };

  const showFollowUpPrompt = allStepsDone && wf.followUp && !incident.followUp && !incident.followUpDismissed;

  return (
    <div style={{ marginTop: 10, background: 'var(--bg2)', border: `1px solid ${wf.color}33`, borderRadius: 6, overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }} onClick={() => setExpanded(e => !e)}>
        <span style={{ fontSize: 11, color: wf.color, fontWeight: 600, whiteSpace: 'nowrap' }}>{wf.label}</span>
        <div style={{ flex: 1, height: 3, background: '#0f1e35', borderRadius: 2, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${pct}%`, background: `linear-gradient(90deg, ${wf.color}, var(--green))`, borderRadius: 2, transition: 'width 0.3s' }} />
        </div>
        <span style={{ fontSize: 10, color: 'var(--text3)', whiteSpace: 'nowrap' }}>{completed}/{total}</span>
        <span style={{ fontSize: 10, color: 'var(--text4)' }}>{expanded ? '▲' : '▼'}</span>
        <span style={{ fontSize: 10, color: 'var(--text4)', padding: '0 2px' }}
          onClick={e => { e.stopPropagation(); if (window.confirm('Remove this incident?')) onRemove(); }}>✕</span>
      </div>

      {/* Expanded */}
      {expanded && (
        <div style={{ borderTop: `1px solid ${wf.color}22`, padding: '10px 12px' }}>
          <div style={{ display: 'flex', border: '1px solid var(--border)', borderRadius: 4, overflow: 'hidden', marginBottom: 10 }}>
            {[['checklist', `✓ Steps (${completed}/${total})`], ['note', '✎ Note']].map(([key, label]) => (
              <button key={key} onClick={() => setActiveTab(key)} style={{ flex: 1, padding: '7px', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: 10, background: activeTab === key ? 'var(--blue-dim)' : 'transparent', color: activeTab === key ? 'var(--blue2)' : 'var(--text3)', borderRight: key === 'checklist' ? '1px solid var(--border)' : 'none', transition: 'all 0.15s' }}>
                {label}
              </button>
            ))}
          </div>

          {activeTab === 'checklist' && (
            <div>
              {wf.steps.map(step => (
                <div key={step.id} onClick={() => toggleStep(step.id)} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '8px 10px', marginBottom: 4, background: incident.checklist?.[step.id] ? 'var(--green-dim)' : 'var(--bg3)', border: `1px solid ${incident.checklist?.[step.id] ? 'var(--green-border)' : 'var(--border)'}`, borderRadius: 5, cursor: 'pointer', transition: 'all 0.12s' }}>
                  <div style={{ fontSize: 14, color: incident.checklist?.[step.id] ? 'var(--green)' : 'var(--border2)', flexShrink: 0, marginTop: 1 }}>{incident.checklist?.[step.id] ? '✓' : '○'}</div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: incident.checklist?.[step.id] ? '#4ade80' : 'var(--text)', textDecoration: incident.checklist?.[step.id] ? 'line-through' : 'none', marginBottom: 1 }}>{step.label}</div>
                    <div style={{ fontSize: 10, color: 'var(--text3)', lineHeight: 1.4 }}>{step.detail}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'note' && (
            <div>
              <div className="label" style={{ marginBottom: 5 }}>RAW NOTES</div>
              <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
                <textarea className="input" rows={5} placeholder="Type or speak your notes..." value={incident.rawNotes || ''} onChange={e => setNotes(e.target.value)} style={{ width: '100%', fontSize: 12 }} />
              </div>
              <div style={{ display: 'flex', gap: 6, marginBottom: 8, alignItems: 'center' }}>
                <MicButton onTranscript={setNotes} />
                <button className="btn btn-primary" style={{ fontSize: 11, padding: '6px 14px' }} onClick={generate} disabled={loading || !incident.rawNotes?.trim()}>{loading ? 'Writing...' : '▶ Generate Note'}</button>
                {report && <button className={`btn-ghost ${copied ? 'success' : ''}`} style={{ fontSize: 11 }} onClick={() => { navigator.clipboard.writeText(report); setCopied(true); setTimeout(() => setCopied(false), 2000); }}>{copied ? '✓ Copied!' : '⎘ Copy'}</button>}
              </div>
              {loading && <div style={{ color: 'var(--text4)', fontSize: 11, marginBottom: 8 }}>⏳ Writing your note...</div>}
              {report && <><div className="label" style={{ marginBottom: 4 }}>FORMATTED NOTE</div><div className="report-box" style={{ fontSize: 11 }}>{report}</div></>}
            </div>
          )}
        </div>
      )}

      {/* Follow-up (outside expanded, always visible once steps done) */}
      {(showFollowUpPrompt || incident.followUp) && (
        <div style={{ padding: '0 12px 10px' }}>
          <FollowUpSection
            followUp={incident.followUp}
            followUpDismissed={incident.followUpDismissed}
            followUpLabel={wf.followUp?.label}
            followUpTasks={wf.followUp?.tasks || []}
            onActivate={activateFollowUp}
            onToggle={toggleFollowUpTask}
            onDismiss={dismissFollowUp}
          />
        </div>
      )}
    </div>
  );
}

// ── PATIENT CARD ──────────────────────────────────────────────────
function PatientCard({ p, onToggleTask, onUpdateNote, onRemove, onAddIncident, onUpdateIncident, onRemoveIncident, onAddNursing, onUpdateNursing, onRemoveNursing, onUpdatePatient }) {
  const [editingNote, setEditingNote] = useState(false);
  const [showIncidentPicker, setShowIncidentPicker] = useState(false);
  const [showNursingPicker, setShowNursingPicker] = useState(false);

  const allDone = p.completedTasks.length === p.tasks.length;

  const activateGenericFollowUp = () => onUpdatePatient({ ...p, genericFollowUp: { completedTasks: [] }, genericFollowUpDismissed: false });
  const dismissGenericFollowUp = () => onUpdatePatient({ ...p, genericFollowUpDismissed: true });
  const toggleGenericFollowUpTask = task => {
    const curr = p.genericFollowUp?.completedTasks || [];
    const updated = curr.includes(task) ? curr.filter(t => t !== task) : [...curr, task];
    onUpdatePatient({ ...p, genericFollowUp: { completedTasks: updated } });
  };

  return (
    <div className={`card ${p.urgent && !allDone ? 'urgent' : ''} ${allDone ? 'complete' : ''}`} style={{ marginBottom: 8 }}>
      <div style={{ padding: '12px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          <div style={{ fontSize: 17, color: allDone ? 'var(--green)' : 'var(--border2)', marginTop: 2, flexShrink: 0 }}>{allDone ? '✓' : '○'}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Name + tags */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap', marginBottom: 4 }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: allDone ? 'var(--text4)' : 'var(--text)', textDecoration: allDone ? 'line-through' : 'none' }}>{p.name}</span>
              {p.urgent && !allDone && <span className="tag tag-urgent">⚠ URGENT</span>}
              {allDone && <span className="tag tag-done">✓ {p.doneTime}</span>}
            </div>

            {p.notes && <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 8 }}>{p.notes}</div>}

            {/* Tasks */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {p.tasks.map(task => (
                <span key={task} className={`chip ${p.completedTasks.includes(task) ? 'done' : ''}`} onClick={() => onToggleTask(task)}>
                  {p.completedTasks.includes(task) ? '✓' : '○'} {task}
                </span>
              ))}
            </div>

            {/* Incidents */}
            {p.incidents?.map(inc => (
              <IncidentPanel key={inc.id} incident={inc}
                onUpdate={updated => onUpdateIncident(inc.id, updated)}
                onRemove={() => onRemoveIncident(inc.id)}
              />
            ))}

            {/* Nursing governance tasks */}
            {p.nursingTasks?.map(task => (
              <NursingPanel key={task.id} task={task}
                onUpdate={updated => onUpdateNursing(task.id, updated)}
                onRemove={() => onRemoveNursing(task.id)}
              />
            ))}

            {/* Generic follow-up (always available, not tied to incident) */}
            <FollowUpSection
              followUp={p.genericFollowUp}
              followUpDismissed={p.genericFollowUpDismissed}
              followUpLabel={GENERIC_FOLLOWUP.label}
              followUpTasks={GENERIC_FOLLOWUP.tasks}
              onActivate={activateGenericFollowUp}
              onToggle={toggleGenericFollowUpTask}
              onDismiss={dismissGenericFollowUp}
            />

            {/* Clinical note */}
            {p.note && <div className="note-box" style={{ marginTop: 8 }}>{p.note}</div>}
            {editingNote && (
              <div style={{ marginTop: 8 }}>
                <div style={{ display: 'flex', gap: 6, marginBottom: 5, alignItems: 'flex-start' }}>
                  <textarea className="input" rows={2} placeholder="Clinical note..." value={p.note}
                    onChange={e => onUpdateNote(e.target.value)} autoFocus
                    style={{ width: '100%', fontSize: 12 }} />
                </div>
                <MicButton onTranscript={val => onUpdateNote(typeof val === 'function' ? val(p.note || '') : val)} />
              </div>
            )}

            {/* Incident picker */}
            {showIncidentPicker && (
              <div style={{ marginTop: 10, padding: '10px 12px', background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: 6 }}>
                <div className="label" style={{ marginBottom: 8 }}>SELECT INCIDENT TYPE</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                  {Object.entries(INCIDENT_WORKFLOWS).map(([key, wf]) => (
                    <button key={key} className="btn-ghost" style={{ fontSize: 10, padding: '4px 10px', borderColor: wf.color + '88', color: wf.color }}
                      onClick={() => { onAddIncident(key); setShowIncidentPicker(false); }}>
                      {wf.label}
                    </button>
                  ))}
                </div>
                <button className="btn-ghost" style={{ fontSize: 10, marginTop: 8 }} onClick={() => setShowIncidentPicker(false)}>Cancel</button>
              </div>
            )}

            {/* Nursing task picker */}
            {showNursingPicker && (
              <div style={{ marginTop: 10, padding: '10px 12px', background: 'var(--bg3)', border: '1px solid #22c55e44', borderRadius: 6 }}>
                <div className="label" style={{ marginBottom: 8, color: '#22c55e' }}>SELECT NURSING TASK</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                  {Object.entries(NURSING_WORKFLOWS).map(([key, wf]) => (
                    <button key={key} className="btn-ghost" style={{ fontSize: 10, padding: '4px 10px', borderColor: wf.color + '88', color: wf.color }}
                      onClick={() => { onAddNursing(key); setShowNursingPicker(false); }}>
                      {wf.label} <span style={{ fontSize: 9, opacity: 0.7 }}>· {wf.frequency}</span>
                    </button>
                  ))}
                </div>
                <button className="btn-ghost" style={{ fontSize: 10, marginTop: 8 }} onClick={() => setShowNursingPicker(false)}>Cancel</button>
              </div>
            )}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flexShrink: 0 }}>
            <button className="btn-ghost" style={{ fontSize: 10, padding: '3px 8px', borderColor: '#f9731688', color: '#f97316', whiteSpace: 'nowrap' }}
              onClick={() => { setShowNursingPicker(false); setShowIncidentPicker(v => !v); }}>
              {showIncidentPicker ? '✕' : '+ Incident'}
            </button>
            <button className="btn-ghost" style={{ fontSize: 10, padding: '3px 8px', borderColor: '#22c55e88', color: '#22c55e', whiteSpace: 'nowrap' }}
              onClick={() => { setShowIncidentPicker(false); setShowNursingPicker(v => !v); }}>
              {showNursingPicker ? '✕' : '+ Nursing'}
            </button>
            <button className="btn-ghost" style={{ fontSize: 10, padding: '3px 8px', whiteSpace: 'nowrap' }}
              onClick={() => { setShowIncidentPicker(false); if (!p.genericFollowUp && !p.genericFollowUpDismissed) activateGenericFollowUp(); }}>
              📅 Follow-up
            </button>
            <button className="btn-ghost" style={{ fontSize: 11, padding: '3px 8px' }} onClick={() => setEditingNote(v => !v)}>
              {editingNote ? '✕' : '✎ Note'}
            </button>
            <button className="btn-ghost danger" style={{ fontSize: 11, padding: '3px 8px' }} onClick={onRemove}>✕</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── SHIFT TRACKER ─────────────────────────────────────────────────
export default function ShiftTracker({ patients, setPatients, shiftInfo, setShiftInfo, recurringTasks }) {
  const [filter, setFilter] = useState('ALL');
  const [showAdd, setShowAdd] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [newPt, setNewPt] = useState({ name: '', section: 'GENERAL WARD', notes: '', tasks: '', urgent: false });

  const updatePatient = (pid, updater) =>
    setPatients(ps => ps.map(p => p.id === pid ? (typeof updater === 'function' ? updater(p) : updater) : p));

  const toggleTask = (pid, task) => updatePatient(pid, p => {
    const has = p.completedTasks.includes(task);
    const updated = has ? p.completedTasks.filter(t => t !== task) : [...p.completedTasks, task];
    return { ...p, completedTasks: updated, doneTime: updated.length === p.tasks.length ? getNow() : null };
  });

  const addIncident = (pid, type) => updatePatient(pid, p => ({
    ...p, incidents: [...(p.incidents || []),
      { id: Date.now(), type, residentName: p.name, checklist: {}, rawNotes: '', report: '', followUp: null, followUpDismissed: false }
    ]
  }));

  const updateIncident = (pid, incId, updated) => updatePatient(pid, p => ({
    ...p, incidents: p.incidents.map(i => i.id === incId ? updated : i)
  }));

  const removeIncident = (pid, incId) => updatePatient(pid, p => ({
    ...p, incidents: p.incidents.filter(i => i.id !== incId)
  }));

  const addNursing = (pid, type) => updatePatient(pid, p => ({
    ...p, nursingTasks: [...(p.nursingTasks || []),
      { id: Date.now(), type, residentName: p.name, checklist: {}, rawNotes: '', report: '' }
    ]
  }));

  const updateNursing = (pid, taskId, updated) => updatePatient(pid, p => ({
    ...p, nursingTasks: p.nursingTasks.map(t => t.id === taskId ? updated : t)
  }));

  const removeNursing = (pid, taskId) => updatePatient(pid, p => ({
    ...p, nursingTasks: p.nursingTasks.filter(t => t.id !== taskId)
  }));

  const removePatient = pid => { if (window.confirm('Remove this patient?')) setPatients(ps => ps.filter(p => p.id !== pid)); };

  const addPatient = () => {
    if (!newPt.name.trim()) return;
    const extra = newPt.tasks.split(',').map(t => t.trim()).filter(Boolean);
    const allTasks = [...new Set([...recurringTasks, ...extra])];
    setPatients(ps => [...ps, {
      id: Date.now(), name: newPt.name.trim(), section: newPt.section,
      notes: newPt.notes, urgent: newPt.urgent, tasks: allTasks,
      completedTasks: [], note: '', doneTime: null, incidents: [], nursingTasks: [],
      genericFollowUp: null, genericFollowUpDismissed: false, addedAt: Date.now()
    }]);
    setNewPt({ name: '', section: 'GENERAL WARD', notes: '', tasks: '', urgent: false });
    setShowAdd(false);
  };

  const resetShift = () => {
    setPatients(ps => ps.map(p => ({
      ...p, completedTasks: [], note: '', doneTime: null,
      incidents: [], nursingTasks: [], genericFollowUp: null, genericFollowUpDismissed: false, addedAt: Date.now()
    })));
    setShiftInfo(s => ({ ...s, date: getDate() }));
    setShowReset(false);
  };

  const total = patients.flatMap(p => p.tasks).length;
  const done = patients.flatMap(p => p.completedTasks).length;
  const pct = total ? Math.round((done / total) * 100) : 0;

  const filtered = patients.filter(p => {
    if (filter === 'DONE') return p.completedTasks.length === p.tasks.length;
    if (filter === 'PENDING') return p.completedTasks.length < p.tasks.length;
    if (filter === 'URGENT') return p.urgent;
    return true;
  });

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <div>
            <div className="page-title-label">TODAY'S SHIFT</div>
            <div className="page-title">Patient Board</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 28, fontWeight: 800, fontFamily: 'var(--font-display)', color: pct === 100 ? 'var(--green)' : 'var(--blue)' }}>{pct}%</div>
            <div style={{ fontSize: 10, color: 'var(--text3)' }}>{done}/{total} tasks</div>
          </div>
        </div>
        <div className="progress-track" style={{ marginBottom: 14 }}>
          <div className="progress-fill" style={{ width: `${pct}%` }} />
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          {[['DATE', 'date', 110], ['SHIFT', 'shift', 90], ['RN', 'rn', 150]].map(([lbl, key, w]) => (
            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 9, color: 'var(--text4)', letterSpacing: '0.12em' }}>{lbl}</span>
              <input className="input" value={shiftInfo[key]} onChange={e => setShiftInfo(s => ({ ...s, [key]: e.target.value }))} placeholder="—" style={{ width: w }} />
            </div>
          ))}
          <button className="btn-ghost" style={{ marginLeft: 'auto' }} onClick={() => setShowReset(true)}>↺ New Shift</button>
        </div>
      </div>

      <div style={{ borderBottom: '1px solid #0f1e35', padding: '8px 24px', display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
        {['ALL', 'URGENT', 'PENDING', 'DONE'].map(f => (
          <button key={f} className={`btn-ghost ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>{f}</button>
        ))}
        <button className="btn-ghost" style={{ marginLeft: 'auto', borderColor: 'var(--green-border)', color: 'var(--green)' }} onClick={() => setShowAdd(true)}>+ Add Patient</button>
      </div>

      <div style={{ padding: '16px 24px 60px' }}>
        {patients.length === 0 && (
          <div style={{ textAlign: 'center', padding: '50px 0', color: 'var(--text4)', fontSize: 13 }}>
            No patients yet — <span style={{ color: 'var(--green)', cursor: 'pointer' }} onClick={() => setShowAdd(true)}>+ Add your first patient</span>
          </div>
        )}
        {Object.keys(SECTION_CONFIG).map(section => {
          const pts = filtered.filter(p => p.section === section);
          if (!pts.length) return null;
          const cfg = SECTION_CONFIG[section];
          return (
            <div key={section} style={{ marginBottom: 24 }}>
              <div className="section-header" style={{ color: cfg.color, borderBottom: `1px solid ${cfg.color}22` }}>
                {cfg.icon} {section} <span style={{ color: 'var(--border2)', fontWeight: 300 }}>· {pts.length}</span>
              </div>
              {pts.map(p => (
                <PatientCard key={p.id} p={p}
                  onToggleTask={task => toggleTask(p.id, task)}
                  onUpdateNote={val => updatePatient(p.id, pt => ({ ...pt, note: val }))}
                  onRemove={() => removePatient(p.id)}
                  onAddIncident={type => addIncident(p.id, type)}
                  onUpdateIncident={(incId, updated) => updateIncident(p.id, incId, updated)}
                  onRemoveIncident={incId => removeIncident(p.id, incId)}
                  onAddNursing={type => addNursing(p.id, type)}
                  onUpdateNursing={(taskId, updated) => updateNursing(p.id, taskId, updated)}
                  onRemoveNursing={taskId => removeNursing(p.id, taskId)}
                  onUpdatePatient={updated => updatePatient(p.id, () => updated)}
                />
              ))}
            </div>
          );
        })}
      </div>

      {showAdd && (
        <div className="modal-bg" onClick={() => setShowAdd(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">Add Patient</div>
            <div className="label">ROOM / BED (e.g. RM 1)</div>
            <input className="input" style={{ width: '100%', marginBottom: 12 }} placeholder="e.g. RM 1, RM 2, Bed 3A" value={newPt.name} onChange={e => setNewPt(p => ({ ...p, name: e.target.value }))} autoFocus onKeyDown={e => e.key === 'Enter' && addPatient()} />
            <div className="label">WARD</div>
            <select className="input" style={{ width: '100%', marginBottom: 12 }} value={newPt.section} onChange={e => setNewPt(p => ({ ...p, section: e.target.value }))}>
              {Object.keys(SECTION_CONFIG).map(s => <option key={s}>{s}</option>)}
            </select>
            <div className="label">SITUATION / NOTES</div>
            <input className="input" style={{ width: '100%', marginBottom: 12 }} placeholder="e.g. Post-fall, monitoring" value={newPt.notes} onChange={e => setNewPt(p => ({ ...p, notes: e.target.value }))} />
            <div className="label">EXTRA TASKS (comma separated)</div>
            <input className="input" style={{ width: '100%', marginBottom: 6 }} placeholder="e.g. Wound check, GP call" value={newPt.tasks} onChange={e => setNewPt(p => ({ ...p, tasks: e.target.value }))} />
            <div style={{ fontSize: 10, color: 'var(--text4)', marginBottom: 14 }}>Recurring auto-added: {recurringTasks.join(', ') || 'none set'}</div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', marginBottom: 18, fontSize: 12, color: 'var(--text2)' }}>
              <input type="checkbox" checked={newPt.urgent} onChange={e => setNewPt(p => ({ ...p, urgent: e.target.checked }))} />
              Mark as URGENT
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-primary" onClick={addPatient}>Add Patient</button>
              <button className="btn-ghost" onClick={() => setShowAdd(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showReset && (
        <div className="modal-bg" onClick={() => setShowReset(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">Start New Shift?</div>
            <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 20 }}>Clears all task progress, notes, incidents and follow-ups. Patient list stays. Date updates to today.</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-primary" style={{ background: 'var(--red)' }} onClick={resetShift}>Yes, Reset Shift</button>
              <button className="btn-ghost" onClick={() => setShowReset(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
