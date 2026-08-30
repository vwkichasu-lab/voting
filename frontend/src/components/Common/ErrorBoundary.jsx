import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(err) {
    return { error: err };
  }

  componentDidCatch(error, info) {
    const payload = {
      message: error.message,
      stack: error.stack,
      componentStack: (info && info.componentStack) || ''
    };
    try {
      fetch('/api/client-error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).catch(() => {});
    } catch {}
  }

  render() {
    if (this.state.error) {
      const e = this.state.error;
      return (
        <div style={{ padding: '2rem', color: '#b91c1c', fontFamily: 'ui-monospace,monospace' }}>
          <h2 style={{ marginTop: 0 }}>Something went wrong rendering this page</h2>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: '0.85rem', background: '#fef2f2', padding: '1rem', borderRadius: 8, border: '1px solid #fecaca' }}>
            {e.message}
            {'\n\nStack:\n'}
            {e.stack}
          </pre>
          {this.props.fallback}
        </div>
      );
    }
    return this.props.children;
  }
}
