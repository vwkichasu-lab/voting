import { useEffect } from 'react';
import { Icon } from './icons.jsx';

export { Icon };

export function Alert({ type = 'info', children }) {
  return (
    <div className={`alert alert-${type}`}>
      {type === 'error' ? '⚠ ' : type === 'success' ? '✓ ' : type === 'warning' ? '! ' : ''}{children}
    </div>
  );
}

export function Modal({ title, onClose, children, wide, footer }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <div className="overlay" onClick={onClose}>
      <div className={`modal ${wide ? 'wide' : ''}`} onClick={(e) => e.stopPropagation()}>
        <div className="modal-head between">
          {title && <h3 className="modal-title">{title}</h3>}
          <button className="modal-close btn btn-ghost btn-sm" onClick={onClose} aria-label="Close">
            <Icon name="x" size={18} />
          </button>
        </div>
        {children}
        {footer && <div className="modal-foot row between mt-2">{footer}</div>}
      </div>
    </div>
  );
}

export function Loader({ label }) {
  return (
    <div className="loading-page">
      <div className="col center gap-2">
        <div className="spinner" />
        {label && <p className="muted">{label}</p>}
      </div>
    </div>
  );
}

export function Badge({ kind = 'gray', children }) {
  return <span className={`badge badge-${kind}`}>{children}</span>;
}

export function Toast({ toasts, onClose }) {
  return (
    <div className="toast-wrap">
      {toasts.map((t) => (
        <div key={t.id} className={`toast ${t.type}`} onClick={() => onClose(t.id)}>
          {t.message}
        </div>
      ))}
    </div>
  );
}

/* ---------- Charts (pure SVG, no deps) ---------- */
export function DonutChart({ value, size = 160, stroke = 18, color = '#6366f1', label, sub }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, value));
  const offset = c - (pct / 100) * c;
  return (
    <div className="chart-donut">
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#eef2f7" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={c}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
        <text x="50%" y="46%" textAnchor="middle" fontSize="1.6rem" fontWeight="800" fill="#1e293b" fontFamily="Poppins, sans-serif">
          {label ?? `${Math.round(pct)}%`}
        </text>
        {sub && (
          <text x="50%" y="60%" textAnchor="middle" fontSize="0.75rem" fill="#64748b">
            {sub}
          </text>
        )}
      </svg>
    </div>
  );
}

export function BarChart({ data, unit = '' }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div>
      {data.map((d, i) => (
        <div className="bar-row" key={i}>
          <span className="bar-label">{d.label}</span>
          <div className="bar-track">
            <div className="bar-fill" style={{ width: `${(d.value / max) * 100}%`, background: d.color || '#2563eb' }} />
          </div>
          <span className="bar-val">{d.value}{unit}</span>
        </div>
      ))}
    </div>
  );
}

export function LineChart({ points, height = 180, color = '#2563eb' }) {
  const w = 520;
  const h = height;
  const pad = 24;
  const max = Math.max(1, ...points.map((p) => p.y));
  const stepX = points.length > 1 ? (w - pad * 2) / (points.length - 1) : 0;
  const coords = points.map((p, i) => [pad + i * stepX, h - pad - (p.y / max) * (h - pad * 2)]);
  const path = coords.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c[0].toFixed(1)} ${c[1].toFixed(1)}`).join(' ');
  const area = `${path} L ${coords[coords.length - 1][0].toFixed(1)} ${h - pad} L ${coords[0][0].toFixed(1)} ${h - pad} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} preserveAspectRatio="none">
      <defs>
        <linearGradient id="lc" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#lc)" />
      <path d={path} fill="none" stroke={color} strokeWidth="2.5" />
      {coords.map((c, i) => (
        <circle key={i} cx={c[0]} cy={c[1]} r="3" fill={color} />
      ))}
    </svg>
  );
}
