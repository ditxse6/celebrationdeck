import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './auth/auth';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Landing from './pages/Landing';
import Login from './pages/Login';
import RequestAccess from './pages/RequestAccess';
import Pending from './pages/Pending';
import Denied from './pages/Denied';
import OtherLanguages from './pages/OtherLanguages';
import AppHome from './pages/app/AppHome';
import AdminHome from './pages/admin/AdminHome';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Landing />} />
            <Route path="login" element={<Login />} />
            <Route path="other-languages" element={<OtherLanguages />} />
            <Route path="request-access" element={<RequestAccess />} />
            <Route path="pending" element={<Pending />} />
            <Route path="denied" element={<Denied />} />
            <Route
              path="app/*"
              element={
                <ProtectedRoute require="approved">
                  <AppHome />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin/*"
              element={
                <ProtectedRoute require="admin">
                  <AdminHome />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
