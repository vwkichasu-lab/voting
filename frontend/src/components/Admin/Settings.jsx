import { useState } from 'react';
import { Icon } from '../common/ui.jsx';

const SECTIONS = [
  { title: 'Election Settings', fields: ['Election name', 'Voting rules', 'Start time', 'End time', 'Allow results visibility'] },
  { title: 'Security', fields: ['Session timeout', 'OTP configuration', 'Login restrictions', 'Single-session enforcement'] },
  { title: 'Notification Settings', fields: ['Email notifications', 'SMS notifications', 'Election reminders'] },
  { title: 'System Settings', fields: ['Institution name', 'Logo', 'Theme', 'Academic year'] }
];

export function Settings() {
  const [saved, setSaved] = useState(false);
  return (
    <div className="col gap-2">
      <div className="between">
        <h2 style={{ margin: 0 }}>Settings</h2>
        <button className="btn btn-admin" onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2500); }}><Icon name="check" size={15} /> Save Changes</button>
      </div>
      {saved && <div className="badge badge-green">✓ Settings saved</div>}
      {SECTIONS.map((s) => (
        <div className="card" key={s.title}>
          <h3>{s.title}</h3>
          <div className="grid grid-2 mt-1">
            {s.fields.map((f) => (
              <div className="field" key={f} style={{ margin: 0 }}>
                <label>{f}</label>
                <input defaultValue="" placeholder={`Set ${f.toLowerCase()}`} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
