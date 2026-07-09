import { Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../auth/auth';

export default function Login() {
  const { t } = useTranslation();
  const { loading, status, login } = useAuth();

  if (loading) {
    return (
      <main>
        <div className="container">{t('common.loading')}</div>
      </main>
    );
  }

  const redirectFor: Record<string, string> = {
    unregistered: '/request-access',
    pending: '/pending',
    denied: '/denied',
    approved: '/app',
    admin: '/app',
  };
  if (status !== 'anonymous') return <Navigate to={redirectFor[status] ?? '/'} replace />;

  return (
    <main>
      <div className="container" style={{ maxWidth: 520 }}>
        <div className="card stack">
          <h1 className="page-title">{t('auth.signInTitle')}</h1>
          <p className="lede">{t('auth.signInBody')}</p>
          <button className="btn btn--primary" onClick={() => login()}>
            {t('auth.signInButton')}
          </button>
        </div>
      </div>
    </main>
  );
}
