import { createContext, useContext, useMemo, useState, useCallback } from 'react';
import { adminService } from '../services/index.js';

const AuthContext = createContext(null);

const ADMIN_TOKEN_KEY = 'voting_admin_token';
const ADMIN_USER_KEY = 'voting_admin_user';
const SESSION_KEY = 'voting_session_id';
const STUDENT_KEY = 'voting_student';

export function AuthProvider({ children }) {
  const [adminToken, setAdminToken] = useState(() => localStorage.getItem(ADMIN_TOKEN_KEY));
  const [adminUser, setAdminUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(ADMIN_USER_KEY) || 'null');
    } catch {
      return null;
    }
  });
  const [sessionId, setSessionId] = useState(() => localStorage.getItem(SESSION_KEY));
  const [student, setStudent] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STUDENT_KEY) || 'null');
    } catch {
      return null;
    }
  });

  const adminLogin = useCallback(async (email, password) => {
    const { data } = await adminService.login(email, password);
    localStorage.setItem(ADMIN_TOKEN_KEY, data.token);
    localStorage.setItem(ADMIN_USER_KEY, JSON.stringify({ id: data.user_id, role: data.role }));
    setAdminToken(data.token);
    setAdminUser({ id: data.user_id, role: data.role });
    return data;
  }, []);

  const adminLogout = useCallback(() => {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    localStorage.removeItem(ADMIN_USER_KEY);
    setAdminToken(null);
    setAdminUser(null);
  }, []);

  const setStudentSession = useCallback((session, studentInfo) => {
    localStorage.setItem(SESSION_KEY, session.session_id);
    if (studentInfo) localStorage.setItem(STUDENT_KEY, JSON.stringify(studentInfo));
    setSessionId(session.session_id);
    setStudent(studentInfo || null);
  }, []);

  const clearStudentSession = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(STUDENT_KEY);
    setSessionId(null);
    setStudent(null);
  }, []);

  const markStudentVoted = useCallback(() => {
    setStudent((prev) => {
      const next = { ...(prev || {}), has_voted: true };
      localStorage.setItem(STUDENT_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      adminToken,
      adminUser,
      adminLogin,
      adminLogout,
      isAdmin: !!adminToken,
      sessionId,
      student,
      setStudentSession,
      clearStudentSession,
      markStudentVoted,
      isStudent: !!sessionId
    }),
    [adminToken, adminUser, sessionId, student, adminLogin, adminLogout, setStudentSession, clearStudentSession, markStudentVoted]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
