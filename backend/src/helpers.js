export function ok(res, data, status = 200) {
  return res.status(status).json({ success: true, ...data });
}

export function fail(res, code, message, status = 400, details = {}) {
  return res.status(status).json({
    success: false,
    error: code,
    message,
    details
  });
}

export function maskContact(contact) {
  if (!contact) return '****';
  const digits = String(contact).replace(/\D/g, '');
  if (digits.length < 2) return '****';
  return '****' + digits.slice(-2);
}

export function nowISO(offsetMinutes = 0) {
  return new Date(Date.now() + offsetMinutes * 60000).toISOString();
}

export function parseBearer(req) {
  const header = req.headers['authorization'] || '';
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match ? match[1].trim() : null;
}

export function rateLimitFactory({ windowMs, max }) {
  const hits = new Map();
  return function (key) {
    const now = Date.now();
    const record = hits.get(key) || { count: 0, start: now };
    if (now - record.start > windowMs) {
      record.count = 0;
      record.start = now;
    }
    record.count += 1;
    hits.set(key, record);
    const remaining = Math.max(0, max - record.count);
    const reset = Math.ceil((record.start + windowMs) / 1000);
    return { remaining, reset, limited: record.count > max };
  };
}
