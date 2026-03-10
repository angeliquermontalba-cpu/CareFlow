import { useState } from 'react';
import { RECURRING_DEFAULTS } from '../data/workflows.js';

export default function Settings({ recurringTasks, setRecurringTasks, setPatients }) {
  const [newTask, setNewTask] = useState('');
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('cf_apikey') || '');
  const [apiSaved, setApiSaved] = useState(false);

  const addTask = () => {
    if (!newTask.trim() || recurringTasks.includes(newTask.trim())) return;
    setRecurringTasks(t => [...t, newTask.trim()]);
    setNewTask('');
  };

  const saveApiKey = () => {
    localStorage.setItem('cf_apikey', apiKey);
    setApiSaved(true);
    setTimeout(() => setApiSaved(false), 2000);
  };

  const resetRecurring = () => {
    if (window.confirm('Reset recurring tasks to defaults?')) setRecurringTasks(RECURRING_DEFAULTS);
  };

  return (
    <div style={{ padding: '16px 24px 60px' }}>
      <div className="page-title-label">CONFIGURATION</div>
      <div className="page-title" style={{ marginBottom: 24 }}>Settings</div>

      {/* API Key */}
      <div style={{ marginBottom: 28, padding: '16px', background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: 8 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, marginBottom: 4 }}>🔑 Anthropic API Key</div>
        <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 12 }}>Required for AI note generation and handover. Your key is stored only on your computer. <a href="https://console.anthropic.com/" target="_blank" rel="noreferrer" style={{ color: 'var(--blue)' }}>Get a key here →</a></div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input className="input" type="password" placeholder="sk-ant-..." value={apiKey} onChange={e => setApiKey(e.target.value)} style={{ flex: 1 }} />
          <button className={`btn-ghost ${apiSaved ? 'success' : ''}`} onClick={saveApiKey}>{apiSaved ? '✓ Saved!' : 'Save Key'}</button>
        </div>
        {apiKey && <div style={{ fontSize: 10, color: 'var(--green)', marginTop: 6 }}>✓ API key is set</div>}
      </div>

      {/* Recurring tasks */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, marginBottom: 4 }}>🔁 Recurring Tasks</div>
        <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 12 }}>These tasks are automatically added to every new patient you create.</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
          {recurringTasks.map(t => (
            <span key={t} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: 4, fontSize: 12, color: '#7dd3fc' }}>
              {t}
              <span style={{ cursor: 'pointer', color: 'var(--text3)', fontSize: 14 }} onClick={() => setRecurringTasks(rt => rt.filter(x => x !== t))}>×</span>
            </span>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <input className="input" placeholder="New recurring task..." value={newTask} onChange={e => setNewTask(e.target.value)} onKeyDown={e => e.key === 'Enter' && addTask()} style={{ flex: 1 }} />
          <button className="btn btn-primary" onClick={addTask}>Add</button>
        </div>
        <button className="btn-ghost" onClick={resetRecurring} style={{ fontSize: 10 }}>↺ Reset to defaults</button>
      </div>

      {/* Danger zone */}
      <div style={{ padding: '16px', background: '#0f0808', border: '1px solid #3d1515', borderRadius: 8 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, color: '#fca5a5', marginBottom: 6 }}>⚠️ Danger Zone</div>
        <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 12 }}>Remove all patients from the shift board. This cannot be undone.</div>
        <button className="btn-ghost danger" onClick={() => { if (window.confirm('Remove ALL patients? This cannot be undone.')) setPatients([]); }}>
          ✕ Clear All Patients
        </button>
      </div>
    </div>
  );
}
