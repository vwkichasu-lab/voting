import { parseBearer, fail, rateLimitFactory } from './helpers.js';
import { getSession } from './services/authService.js';
import { getAdminByToken } from './services/adminService.js';

export function authenticateAdmin(req, res, next) {
  const token = parseBearer(req);
  const user = getAdminByToken(token);
  if (!user) return fail(res, 'UNAUTHORIZED', 'Invalid or expired admin session', 401);
  req.admin = user;
  next();
}

export function authenticateSession(req, res, next) {
  const token = parseBearer(req);
  const session = getSession(token);
  if (!session) return fail(res, 'INVALID_SESSION', 'Session invalid or expired', 401);
  req.session = session;
  next();
}

export function requireElectionOpen(req, res, next) {
  // Used for student voting endpoints; enforced inside services as well.
  next();
}

const otpReqLimiter = rateLimitFactory({ windowMs: 15 * 60 * 1000, max: 3 });
const otpVerifyLimiter = rateLimitFactory({ windowMs: 5 * 60 * 1000, max: 5 });
const loginLimiter = rateLimitFactory({ windowMs: 15 * 60 * 1000, max: 5 });

export function rateLimitOtpRequest(req, res, next) {
  const key = 'otp_req_' + (req.body?.student_id || req.ip || 'anon');
  const r = otpReqLimiter(key);
  res.set('X-RateLimit-Limit', '3');
  res.set('X-RateLimit-Remaining', String(r.remaining));
  res.set('X-RateLimit-Reset', String(r.reset));
  if (r.limited) return fail(res, 'RATE_LIMITED', 'Too many requests. Try again later.', 429);
  next();
}

export function rateLimitOtpVerify(req, res, next) {
  const key = 'otp_ver_' + (req.body?.student_id || req.ip || 'anon');
  const r = otpVerifyLimiter(key);
  res.set('X-RateLimit-Limit', '5');
  res.set('X-RateLimit-Remaining', String(r.remaining));
  res.set('X-RateLimit-Reset', String(r.reset));
  if (r.limited) return fail(res, 'RATE_LIMITED', 'Too many attempts. Request a new code.', 429);
  next();
}

export function rateLimitLogin(req, res, next) {
  const key = 'login_' + (req.body?.username || req.ip || 'anon');
  const r = loginLimiter(key);
  res.set('X-RateLimit-Limit', '5');
  res.set('X-RateLimit-Remaining', String(r.remaining));
  res.set('X-RateLimit-Reset', String(r.reset));
  if (r.limited) return fail(res, 'RATE_LIMITED', 'Too many login attempts. Try again later.', 429);
  next();
}
