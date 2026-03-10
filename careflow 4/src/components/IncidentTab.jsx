import { useState } from 'react';
import { INCIDENT_WORKFLOWS } from '../data/workflows.js';

export default function IncidentTab({ patients }) {
  const [viewingId, setViewingId] = useState(null);
  const [filterType, setFilterType] = useState('ALL');

  // Collect all incidents across all patients
  const allIncidents = patients.flatMap(p =>
    (p.incidents || []).map(inc => ({ ...inc, residentName: p.name, section: p.section }))
  ).sort((a, b) => b.id - a.id);

  const filtered = filterType === 'ALL' ? allIncidents : allIncidents.filter(i => i.type === filterType);

  const viewing = viewingId !== null ? allIncidents.find(x => x.id === viewingId) : null;

  if (viewing) {
    const wf = INCIDENT_WORKFLOWS[viewing.type];
    const completed = wf?.steps.filter(s => viewing.checklist?.[s.id]).length || 0;
    const total = wf?.steps.length || 0;
    return (
      <div style={{ padding: '16px 24px 60px' }} className="fade-in">
        <button className="btn-ghost" style={{ marginBottom: 16 }} onClick={() => setViewingId(null)}>← Back</button>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, marginBottom: 2 }}>{viewing.residentName}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
          <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 3, background: (wf?.color || '#888') + '20', border: `1px solid ${(wf?.color || '#888')}44`, color: wf?.color }}>{wf?.label}</span>
          <span style={{ fontSize: 10, color: 'var(--text3)' }}>{viewing.section}</span>
        </div>
        {wf && (
          <div style={{ marginBottom: 20 }}>
            <div className="label" style={{ marginBottom: 8 }}>CHECKLIST — {completed}/{total} completed</div>
            <div style={{ height: 3, background: '#0f1e35', borderRadius: 2, marginBottom: 10, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: total ? `${Math.round(completed/total*100)}%` : '0%', background: `linear-gradient(90deg, ${wf.color}, var(--green))`, borderRadius: 2 }} />
            </div>
            {wf.steps.map(s => (
              <div key={s.id} style={{ display: 'flex', gap: 8, padding: '6px 0', borderBottom: '1px solid #0f1e35', fontSize: 12, color: viewing.checklist?.[s.id] ? 'var(--green)' : 'var(--text3)' }}>
                <span>{viewing.checklist?.[s.id] ? '✓' : '○'}</span> {s.label}
              </div>
            ))}
          </div>
        )}
        {viewing.report && (
          <div>
            <div className="label" style={{ marginBottom: 8 }}>PROGRESS NOTE</div>
            <div className="report-box">{viewing.report}</div>
          </div>
        )}
        {!viewing.report && (
          <div style={{ padding: '20px', background: 'var(--bg3)', borderRadius: 6, border: '1px solid var(--border)', textAlign: 'center', color: 'var(--text4)', fontSize: 12 }}>
            No progress note generated yet — open this patient on the Shift Board to generate one.
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ padding: '16px 24px 60px' }}>
      <div className="page-title-label">INCIDENT HISTORY</div>
      <div className="page-title" style={{ marginBottom: 4 }}>Incidents</div>
      <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 20 }}>
        All incidents are managed from the patient card on the <strong style={{ color: 'var(--blue)' }}>Shift Board</strong>. This tab is your history and archive.
      </div>

      {/* Filter by type */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 20 }}>
        <button className={`btn-ghost ${filterType === 'ALL' ? 'active' : ''}`} onClick={() => setFilterType('ALL')}>All ({allIncidents.length})</button>
        {Object.entries(INCIDENT_WORKFLOWS).map(([key, wf]) => {
          const count = allIncidents.filter(i => i.type === key).length;
          if (!count) return null;
          return (
            <button key={key} className="btn-ghost" style={filterType === key ? { borderColor: wf.color, color: wf.color, background: wf.color + '18' } : {}} onClick={() => setFilterType(key)}>
              {wf.label} ({count})
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '50px 0', color: 'var(--text4)', fontSize: 13 }}>
          No incidents recorded yet.<br />
          <span style={{ fontSize: 11, marginTop: 6, display: 'block' }}>Add a patient on the Shift Board, then tap <strong style={{ color: 'var(--orange)' }}>+ Incident</strong> on their card.</span>
        </div>
      ) : (
        filtered.map(inc => {
          const wf = INCIDENT_WORKFLOWS[inc.type];
          const completed = wf?.steps.filter(s => inc.checklist?.[s.id]).length || 0;
          const total = wf?.steps.length || 0;
          const pct = total ? Math.round(completed / total * 100) : 0;
          return (
            <div key={inc.id} className="card" style={{ padding: '12px 14px', cursor: 'pointer', marginBottom: 7 }} onClick={() => setViewingId(inc.id)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 600 }}>{inc.residentName}</span>
                    <span style={{ fontSize: 10, padding: '1px 7px', borderRadius: 3, background: (wf?.color || '#888') + '20', border: `1px solid ${(wf?.color || '#888')}44`, color: wf?.color }}>{wf?.label}</span>
                    {inc.report && <span className="tag tag-done" style={{ fontSize: 9 }}>note ✓</span>}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ flex: 1, maxWidth: 160, height: 3, background: '#0f1e35', borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: `linear-gradient(90deg, ${wf?.color || '#888'}, var(--green))`, borderRadius: 2 }} />
                    </div>
                    <span style={{ fontSize: 10, color: 'var(--text3)' }}>{completed}/{total} steps</span>
                  </div>
                </div>
                <span style={{ fontSize: 11, color: 'var(--text4)', marginLeft: 10 }}>View →</span>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
