import { useState } from 'react';
import { HANDOVER_SYSTEM_PROMPT } from '../data/workflows.js';
import { callClaude } from '../data/storage.js';

export default function Handover({ patients, shiftInfo }) {
  const [handover, setHandover] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const pending = patients.filter(p => p.completedTasks.length < p.tasks.length);

  const generate = async () => {
    setLoading(true); setHandover('');
    const summary = pending.length === 0
      ? 'All tasks completed — great shift!'
      : pending.map(p => {
          const rem = p.tasks.filter(t => !p.completedTasks.includes(t));
          return `${p.name} (${p.section}${p.urgent ? ', URGENT' : ''}): outstanding — ${rem.join(', ')}${p.notes ? `. Situation: ${p.notes}` : ''}${p.note ? `. Note: ${p.note}` : ''}`;
        }).join('\n');
    try {
      const text = await callClaude(HANDOVER_SYSTEM_PROMPT,
        `Date: ${shiftInfo.date}\nShift: ${shiftInfo.shift || 'not specified'}\nRN: ${shiftInfo.rn || 'not specified'}\n\nOutstanding:\n${summary}`
      );
      setHandover(text);
    } catch (e) { setHandover(`Error: ${e.message}`); }
    setLoading(false);
  };

  return (
    <div style={{ padding: '16px 24px 60px' }}>
      <div className="page-title-label">END OF SHIFT</div>
      <div className="page-title" style={{ marginBottom: 4 }}>Handover Notes</div>
      <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 20 }}>Auto-generates a clinical handover from your outstanding tasks</div>

      <div style={{ marginBottom: 20, padding: '14px 16px', background: 'var(--bg3)', borderRadius: 7, border: '1px solid var(--border)' }}>
        <div className="label" style={{ marginBottom: 10 }}>OUTSTANDING TASKS</div>
        {pending.length === 0 ? (
          <div style={{ fontSize: 13, color: 'var(--green)' }}>✓ All tasks complete — great shift!</div>
        ) : pending.map(p => {
          const rem = p.tasks.filter(t => !p.completedTasks.includes(t));
          return (
            <div key={p.id} style={{ marginBottom: 10, paddingBottom: 10, borderBottom: '1px solid #0f1e35' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 600, color: p.urgent ? '#fca5a5' : 'var(--text)' }}>
                {p.name} {p.urgent && '⚠'}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>{rem.join(' · ')}</div>
              {p.note && <div style={{ fontSize: 11, color: 'var(--text4)', marginTop: 3, fontStyle: 'italic' }}>{p.note}</div>}
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <button className="btn btn-primary" onClick={generate} disabled={loading}>{loading ? 'Writing...' : '▶ Generate Handover'}</button>
        {handover && (
          <button className={`btn-ghost ${copied ? 'success' : ''}`} onClick={() => { navigator.clipboard.writeText(handover); setCopied(true); setTimeout(() => setCopied(false), 2000); }}>
            {copied ? '✓ Copied!' : '⎘ Copy'}
          </button>
        )}
      </div>

      {loading && <div style={{ color: 'var(--text4)', fontSize: 12 }}>⏳ Writing handover...</div>}
      {handover && (
        <div className="fade-in">
          <div className="label" style={{ marginBottom: 8 }}>HANDOVER SUMMARY</div>
          <div className="report-box">{handover}</div>
        </div>
      )}
    </div>
  );
}
