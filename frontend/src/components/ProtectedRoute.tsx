import { Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth, type AccessStatus } from '../auth/auth';

/**
 * Client-side gate. The authoritative enforcement is server-side via
 * staticwebapp.config.json role rules; this mirrors it for a smooth UX and
 * routes users to the right state page.
 */
export default function ProtectedRoute({
  require,
  children,
}: {
  require: 'approved' | 'admin';
  children: React.ReactNode;
}) {
  const { loading, status } = useAuth();
  const { t } = useTranslation();

  if (loading) {
    return (
      <main>
        <div className="container">{t('common.loading')}</div>
      </main>
    );
  }

  const redirectFor: Partial<Record<AccessStatus, string>> = {
    anonymous: '/login',
    unregistered: '/request-access',
    pending: '/pending',
    denied: '/denied',
  };

  const target = redirectFor[status];
  if (target) return <Navigate to={target} replace />;

  if (require === 'admin' && status !== 'admin') {
    // Approved but not admin trying to reach an admin route.
    return <Navigate to="/app" replace />;
  }

  return <>{children}</>;
}
