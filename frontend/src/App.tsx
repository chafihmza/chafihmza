import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Files from './pages/Files';
import AdminUsers from './pages/AdminUsers';
import AdminConnectors from './pages/AdminConnectors';
import Audit from './pages/Audit';

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const token = localStorage.getItem('accessToken');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/files/:connectorId" element={<ProtectedRoute><Files /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute><AdminUsers /></ProtectedRoute>} />
        <Route path="/admin/connectors" element={<ProtectedRoute><AdminConnectors /></ProtectedRoute>} />
        <Route path="/audit" element={<ProtectedRoute><Audit /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
