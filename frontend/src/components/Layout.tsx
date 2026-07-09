import { NavLink, Link, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../auth/auth';
import Footer from './Footer';
import LanguageSelector from './LanguageSelector';
import DevRoleSwitcher from './DevRoleSwitcher';

export default function Layout() {
  const { t } = useTranslation();
  const { status, logout } = useAuth();

  const isApproved = status === 'approved' || status === 'admin';
  const isAdmin = status === 'admin';
  const isSignedIn = status !== 'anonymous';

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="container topbar__inner">
          <Link to="/" className="brand">
            Celebration<em>Deck</em>
          </Link>
          <div className="topbar__spacer" />
          <nav>
            <NavLink to="/" end>
              {t('nav.home')}
            </NavLink>
            {isApproved && <NavLink to="/app">{t('nav.app')}</NavLink>}
            {isAdmin && <NavLink to="/admin">{t('nav.admin')}</NavLink>}
            <LanguageSelector />
            <DevRoleSwitcher />
            {isSignedIn ? (
              <button className="btn btn--ghost" onClick={() => logout()}>
                {t('nav.signOut')}
              </button>
            ) : (
              <Link className="btn btn--primary" to="/login">
                {t('nav.signIn')}
              </Link>
            )}
          </nav>
        </div>
      </header>
      <Outlet />
      <Footer />
    </div>
  );
}
