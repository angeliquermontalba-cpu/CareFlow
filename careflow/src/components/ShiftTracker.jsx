import { useState } from 'react';
import { SECTION_CONFIG } from '../data/workflows.js';
import { getNow, getDate } from '../data/storage.js';

export default function ShiftTracker({ patients, setPatients, shiftInfo, setShiftInfo, recurringTasks }) {
  const [filter, setFilter] = useState('ALL');
  const [editingNote, setEditingNote] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [newPt, setNewPt] = useState({ name: '', section: 'GENERAL WARD', notes: '', tasks: '', urgent: false });

  const toggleTask = (pid, task) => {
    setPatients(ps => ps.map(p => {
      if (p.id !== pid) return p;
      const has = p.completedTasks.includes(task);
      const updated = has ? p.completedTasks.filter(t => t !== task) : [...p.completedTasks, task];
      return { ...p, completedTasks: updated, doneTime: updated.length === p.tasks.length ? getNow() : null };
    }));
  };

  const updateNote = (pid, val) => setPatients(ps => ps.map(p => p.id === pid ? { ...p, note: val } : p));
  const removePatient = pid => { if (window.confirm('Remove this patient?')) setPatients(ps => ps.filter(p => p.id !== pid)); };

  const addPatient = () => {
    if (!newPt.name.trim()) return;
    const extra = newPt.tasks.split(',').map(t => t.trim()).filter(Boolean);
    const allTasks = [...new Set([...recurringTasks, ...extra])];
    setPatients(ps => [...ps, { id: Date.now(), name: newPt.name.trim(), section: newPt.section, notes: newPt.notes, urgent: newPt.urgent, tasks: allTasks, completedTasks: [], note: '', doneTime: null, addedAt: Date.now() }]);
    setNewPt({ name: '', section: 'GENERAL WARD', notes: '', tasks: '', urgent: false });
    setShowAdd(false);
  };

  const resetShift = () => {
    setPatients(ps => ps.map(p => ({ ...p, completedTasks: [], note: '', doneTime: null, addedAt: Date.now() })));
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
      {/* Header */}
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

      {/* Filters */}
      <div style={{ borderBottom: '1px solid #0f1e35', padding: '8px 24px', display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
        {['ALL', 'URGENT', 'PENDING', 'DONE'].map(f => (
          <button key={f} className={`btn-ghost ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>{f}</button>
        ))}
        <button className="btn-ghost" style={{ marginLeft: 'auto', borderColor: 'var(--green-border)', color: 'var(--green)' }} onClick={() => setShowAdd(true)}>+ Add Patient</button>
      </div>

      {/* List */}
      <div style={{ padding: '16px 24px 60px' }}>
        {patients.length === 0 && (
          <div style={{ textAlign: 'center', padding: '50px 0', color: 'var(--text4)', fontSize: 13 }}>
            No patients yet —<br /><span style={{ color: 'var(--green)', cursor: 'pointer' }} onClick={() => setShowAdd(true)}>+ Add your first patient</span>
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
              {pts.map(p => {
                const allDone = p.completedTasks.length === p.tasks.length;
                return (
                  <div key={p.id} className={`card ${p.urgent && !allDone ? 'urgent' : ''} ${allDone ? 'complete' : ''}`} style={{ marginBottom: 7 }}>
                    <div style={{ padding: '12px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                        <div style={{ fontSize: 17, color: allDone ? 'var(--green)' : 'var(--border2)', marginTop: 1, flexShrink: 0 }}>{allDone ? '✓' : '○'}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap', marginBottom: 4 }}>
                            <span style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: allDone ? 'var(--text4)' : 'var(--text)', textDecoration: allDone ? 'line-through' : 'none' }}>{p.name}</span>
                            {p.urgent && !allDone && <span className="tag tag-urgent">⚠ URGENT</span>}
                            {allDone && <span className="tag tag-done">✓ {p.doneTime}</span>}
                          </div>
                          {p.notes && <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 8 }}>{p.notes}</div>}
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                            {p.tasks.map(task => (
                              <span key={task} className={`chip ${p.completedTasks.includes(task) ? 'done' : ''}`} onClick={() => toggleTask(p.id, task)}>
                                {p.completedTasks.includes(task) ? '✓' : '○'} {task}
                              </span>
                            ))}
                          </div>
                          {p.note && <div className="note-box">{p.note}</div>}
                          {editingNote === p.id && (
                            <textarea className="input" rows={2} placeholder="Clinical note..." value={p.note} onChange={e => updateNote(p.id, e.target.value)} autoFocus onBlur={() => setEditingNote(null)} style={{ marginTop: 8, width: '100%' }} />
                          )}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flexShrink: 0 }}>
                          <button className="btn-ghost" style={{ fontSize: 11, padding: '3px 8px' }} onClick={() => setEditingNote(editingNote === p.id ? null : p.id)}>{editingNote === p.id ? '✕' : '✎'}</button>
                          <button className="btn-ghost danger" style={{ fontSize: 11, padding: '3px 8px' }} onClick={() => removePatient(p.id)}>✕</button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Add patient modal */}
      {showAdd && (
        <div className="modal-bg" onClick={() => setShowAdd(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">Add Patient</div>
            <div className="label">NAME *</div>
            <input className="input" style={{ width: '100%', marginBottom: 12 }} placeholder="Full name" value={newPt.name} onChange={e => setNewPt(p => ({ ...p, name: e.target.value }))} autoFocus onKeyDown={e => e.key === 'Enter' && addPatient()} />
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

      {/* Reset modal */}
      {showReset && (
        <div className="modal-bg" onClick={() => setShowReset(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">Start New Shift?</div>
            <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 20 }}>This clears all task progress and notes, but keeps your patient list. Date updates to today.</div>
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
