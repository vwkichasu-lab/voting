import PropTypes from 'prop-types';

export function LoadingSpinner({ label }) {
  return (
    <div className="spinner-wrap">
      <div className="spinner" />
      {label && <p className="spinner-label">{label}</p>}
    </div>
  );
}
LoadingSpinner.propTypes = { label: PropTypes.string };

export function Alert({ type = 'info', children }) {
  return <div className={`alert alert-${type}`}>{children}</div>;
}
Alert.propTypes = { type: PropTypes.string, children: PropTypes.node };

export function ErrorBoundary({ children }) {
  return children;
}

export function Header() {
  return (
    <header className="app-header">
      <div className="brand">
        <span className="brand-mark">LV</span>
        <span className="brand-text">Level 200 Election</span>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="app-footer">
      <p>Level 200 Combined Class Election &middot; Confidential</p>
    </footer>
  );
}
