import { useState } from 'react';
import { useLocalStorage, getDate } from './data/storage.js';
import { RECURRING_DEFAULTS } from './data/workflows.js';
import ShiftTracker from './components/ShiftTracker.jsx';
import IncidentTab from './components/IncidentTab.jsx';
import Handover from './components/Handover.jsx';
import Settings from './components/Settings.jsx';

export default function App() {
  const [patients, setPatients] = useLocalStorage('cf_patients', []);
  const [shiftInfo, setShiftInfo] = useLocalStorage('cf_shiftinfo', { date: getDate(), shift: '', rn: '' });
  const [savedIncidents, setSavedIncidents] = useLocalStorage('cf_incidents', []);
  const [recurringTasks, setRecurringTasks] = useLocalStorage('cf_recurring', RECURRING_DEFAULTS);
  const [tab, setTab] = useState('shift');

  const urgentPending = patients.filter(p => p.urgent && p.completedTasks.length < p.tasks.length).length;
  const totalPending = patients.filter(p => p.completedTasks.length < p.tasks.length).length;

  const TABS = [
    { key: 'shift',    label: '🏥 Shift',     badge: urgentPending > 0 ? `${urgentPending}⚠` : totalPending > 0 ? String(totalPending) : null, urgent: urgentPending > 0 },
    { key: 'incident', label: '📋 Incidents',  badge: savedIncidents.length > 0 ? String(savedIncidents.length) : null },
    { key: 'handover', label: '🔁 Handover',   badge: totalPending > 0 ? String(totalPending) : null },
    { key: 'settings', label: '⚙ Settings',    badge: null },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      {/* Top nav */}
      <nav style={{ background: 'var(--bg2)', borderBottom: '1px solid #0f1e35', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 800, color: 'var(--blue)', letterSpacing: '-0.02em', padding: '12px 0' }}>
            ⚕ CareFlow
          </div>
          <div style={{ width: 1, height: 20, background: 'var(--border)', margin: '0 4px' }} />
          <div style={{ display: 'flex' }}>
            {TABS.map(t => (
              <button key={t.key} onClick={() => setTab(t.key)} style={{ padding: '14px 14px', fontSize: 11, cursor: 'pointer', border: 'none', background: 'transparent', color: tab === t.key ? 'var(--blue)' : 'var(--text3)', fontFamily: 'var(--font-mono)', letterSpacing: '0.05em', borderBottom: `2px solid ${tab === t.key ? 'var(--blue)' : 'transparent'}`, transition: 'all 0.15s', whiteSpace: 'nowrap' }}>
                {t.label}
                {t.badge && (
                  <span style={{ marginLeft: 5, fontSize: 9, padding: '1px 5px', borderRadius: 10, background: t.urgent ? 'var(--red-dim)' : 'var(--blue-dim)', color: t.urgent ? '#fca5a5' : 'var(--blue2)', border: `1px solid ${t.urgent ? 'var(--red-border)' : 'var(--border2)'}` }}>
                    {t.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', display: 'inline-block' }} />
          <span style={{ fontSize: 9, color: 'var(--text4)' }}>saved locally</span>
        </div>
      </nav>

      {/* Content */}
      <div style={{ flex: 1, maxWidth: 780, width: '100%', margin: '0 auto', paddingBottom: 40 }}>
        {tab === 'shift'    && <ShiftTracker patients={patients} setPatients={setPatients} shiftInfo={shiftInfo} setShiftInfo={setShiftInfo} recurringTasks={recurringTasks} />}
        {tab === 'incident' && <IncidentTab savedIncidents={savedIncidents} setSavedIncidents={setSavedIncidents} />}
        {tab === 'handover' && <Handover patients={patients} shiftInfo={shiftInfo} />}
        {tab === 'settings' && <Settings recurringTasks={recurringTasks} setRecurringTasks={setRecurringTasks} setPatients={setPatients} />}
      </div>
    </div>
  );
}
