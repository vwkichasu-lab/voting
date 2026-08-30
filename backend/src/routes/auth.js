import express from 'express';
import { fail, ok, maskContact } from '../helpers.js';
import { requestCode, verifyCode, studentLogin } from '../services/authService.js';
import { rateLimitOtpRequest, rateLimitOtpVerify, rateLimitLogin } from '../middleware.js';

const router = express.Router();

router.post('/request-code', rateLimitOtpRequest, (req, res) => {
  const { student_id } = req.body || {};
  const normalized = student_id ? student_id.trim().toUpperCase() : '';
  if (!/^PUIT\/\d{8}$/.test(normalized)) {
    return fail(res, 'INVALID_STUDENT_ID', 'Student ID must be PUIT/ followed by 8 digits (e.g. PUIT/10000001)', 400);
  }
  const out = requestCode(normalized, req.ip);
  if (out.error) return fail(res, out.error.code, out.error.message, out.error.status);
  const r = out.result;
  return ok(res, {
    message: `Verification code sent to registered contact ending in ${r.code_delivery_masked}`,
    expires_in_seconds: r.expires_in_seconds,
    code_delivery_masked: r.code_delivery_masked,
    ...(r.dev_otp ? { dev_otp: r.dev_otp } : {})
  });
});

router.post('/login', rateLimitLogin, (req, res) => {
  const { username, password } = req.body || {};
  if (!username) return fail(res, 'INVALID_STUDENT_ID', 'Student ID is required', 400);
  const out = studentLogin(username, password, req.ip);
  if (out.error) return fail(res, out.error.code, out.error.message, out.error.status);
  return ok(res, out.result);
});

router.post('/verify-code', rateLimitOtpVerify, (req, res) => {
  const { student_id, code } = req.body || {};
  if (!student_id) return fail(res, 'INVALID_STUDENT_ID', 'Student ID is required', 400);
  if (!code) return fail(res, 'INVALID_CODE', 'Code is required', 400);
  const out = verifyCode(student_id.trim().toUpperCase(), code, req.ip);
  if (out.error) return fail(res, out.error.code, out.error.message, out.error.status);
  return ok(res, out.result);
});

export default router;
