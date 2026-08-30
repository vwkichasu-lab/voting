import { Modal, Icon } from '../common/ui.jsx';
import { Icon as Ico } from '../common/icons.jsx';

export function positionIcon(name = '') {
  const n = name.toLowerCase();
  if (n.includes('president') || n.includes('representative')) return 'flag';
  if (n.includes('secretary')) return 'document';
  if (n.includes('treasurer') || n.includes('financial')) return 'chart';
  if (n.includes('organizer') || n.includes('sport')) return 'calendar';
  if (n.includes('relation') || n.includes('public')) return 'bell';
  if (n.includes('welfare')) return 'users';
  return 'users';
}

export function initials(name = '') {
  return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
}

export function CandidateCard({ candidate, selected, onSelect, onManifesto }) {
  return (
    <div className={`candidate-card ${selected ? 'selected' : ''}`} onClick={() => onSelect(candidate.id)}>
      <div className="cand-top">
        <div className="cand-photo">{initials(candidate.name)}</div>
        <div>
          <div style={{ fontWeight: 700 }}>{candidate.name}</div>
          <div className="text-xs muted">{candidate.programme || '—'}</div>
          <div className="text-xs muted">{candidate.intake || ''} Intake</div>
        </div>
        <div className="cand-radio">{selected ? <Ico name="check" size={14} /> : null}</div>
      </div>
      <button
        className="btn btn-outline btn-sm"
        onClick={(e) => {
          e.stopPropagation();
          onManifesto(candidate);
        }}
      >
        <Ico name="document" size={15} /> View Manifesto
      </button>
    </div>
  );
}

export function ManifestoModal({ candidate, onClose }) {
  if (!candidate) return null;
  return (
    <Modal title="Candidate Manifesto" onClose={onClose} wide>
      <div className="flex gap-2" style={{ alignItems: 'center', marginBottom: '1rem' }}>
        <div className="cand-photo" style={{ width: 64, height: 64, fontSize: '1.4rem' }}>{initials(candidate.name)}</div>
        <div>
          <h3 style={{ margin: 0 }}>{candidate.name}</h3>
          <div className="muted text-sm">{candidate.intake} Intake · {candidate.programme}</div>
        </div>
      </div>
      <p><strong>Position:</strong> {candidate.position_name || 'Candidate'}</p>
      <p><strong>Manifesto:</strong></p>
      <p>{candidate.manifesto || 'No manifesto provided.'}</p>
      <button className="btn btn-primary" onClick={onClose}>Close</button>
    </Modal>
  );
}

export function Avatar({ name, size = 'md' }) {
  const cls = size === 'lg' ? 'avatar lg' : size === 'sm' ? 'avatar sm' : 'avatar';
  return <div className={cls}>{initials(name)}</div>;
}
