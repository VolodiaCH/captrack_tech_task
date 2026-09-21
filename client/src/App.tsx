import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './pages/AuthPage';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/dashboard" element={<div>Dashboard (Coming in Commit 7)</div>} />
        <Route path="/transactions" element={<div>Transactions (Coming in Phase 3)</div>} />
        <Route path="/categories" element={<div>Categories (Coming in Phase 3)</div>} />
        <Route path="*" element={<div>404 Not Found</div>} />
      </Routes>
    </Router>
  );
}
