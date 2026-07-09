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
          <div className="stack" style={{ gap: 12 }}>
            <button className="btn btn--primary" onClick={() => login('google')}>
              {t('auth.signInGoogle')}
            </button>
            <button className="btn btn--secondary" onClick={() => login('aad')}>
              {t('auth.signInMicrosoft')}
            </button>
          </div>
          <p className="muted" style={{ marginTop: 4, fontSize: '0.9rem' }}>
            {t('auth.orgAccountNote')}
          </p>
        </div>
      </div>
    </main>
  );
}
