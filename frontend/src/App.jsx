import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import { Login } from './components/Student/Login.jsx';
import { Otp } from './components/Student/Otp.jsx';
import { StudentApp } from './components/Student/StudentApp.jsx';
import { Dashboard } from './components/Student/Dashboard.jsx';
import { Ballot } from './components/Student/Ballot.jsx';
import { Review } from './components/Student/Review.jsx';
import { Success } from './components/Student/Success.jsx';
import { Candidates } from './components/Student/Candidates.jsx';
import { ElectionStatus } from './components/Student/ElectionStatus.jsx';
import { History } from './components/Student/History.jsx';
import { Profile } from './components/Student/Profile.jsx';
import { AdminLogin } from './components/Admin/AdminLogin.jsx';
import { AdminApp } from './components/Admin/AdminApp.jsx';
import { AdminDashboard } from './components/Admin/AdminDashboard.jsx';
import { Elections } from './components/Admin/Elections.jsx';
import { Candidates as AdminCandidates } from './components/Admin/Candidates.jsx';
import { Voters } from './components/Admin/Voters.jsx';
import { Positions } from './components/Admin/Positions.jsx';
import { Results } from './components/Admin/Results.jsx';
import { AuditLogs } from './components/Admin/AuditLogs.jsx';
import { Reports } from './components/Admin/Reports.jsx';
import { Settings } from './components/Admin/Settings.jsx';
import { Classes } from './components/Admin/Classes.jsx';
import { Analytics } from './components/Admin/Analytics.jsx';

function RequireStudent({ children }) {
  const { isStudent } = useAuth();
  return isStudent ? children : <Navigate to="/login" replace />;
}
function RequireAdmin({ children }) {
  const { isAdmin } = useAuth();
  return isAdmin ? children : <Navigate to="/admin/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/otp" element={<Otp />} />
      <Route path="/success" element={<Success />} />

      <Route path="/app" element={<RequireStudent><StudentApp /></RequireStudent>}>
        <Route index element={<Dashboard />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="ballot" element={<Ballot />} />
        <Route path="review" element={<Review />} />
        <Route path="candidates" element={<Candidates />} />
        <Route path="status" element={<ElectionStatus />} />
        <Route path="history" element={<History />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={<RequireAdmin><AdminApp /></RequireAdmin>}>
        <Route index element={<AdminDashboard />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="elections" element={<Elections />} />
        <Route path="candidates" element={<AdminCandidates />} />
        <Route path="voters" element={<Voters />} />
        <Route path="positions" element={<Positions />} />
        <Route path="classes" element={<Classes />} />
        <Route path="results" element={<Results />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="reports" element={<Reports />} />
        <Route path="audit" element={<AuditLogs />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
