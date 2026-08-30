export function validateStudentId(value) {
  if (!value) return 'Student ID is required';
  if (!/^PUIT\/\d{8}$/i.test(value.trim())) {
    return 'Format: PUIT/ followed by 8 digits (e.g. PUIT/10000001)';
  }
  return null;
}

export function validateOtp(value) {
  if (!value) return 'Verification code is required';
  if (!/^\d{6}$/.test(value.trim())) return 'Code must be 6 digits';
  return null;
}

export function formatPercent(n) {
  return `${Number(n || 0).toFixed(1)}%`;
}

export function formatTime(seconds) {
  const s = Math.max(0, Number(seconds) || 0);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${sec}s`;
  return `${sec}s`;
}

export function formatDateTime(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}
