import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../auth/auth';

export default function Landing() {
  const { t } = useTranslation();
  const { status } = useAuth();
  const isSignedIn = status !== 'anonymous';

  return (
    <>
      <section className="hero">
        <div className="container">
          <span className="badge badge--accent">{t('landing.eyebrow')}</span>
          <div className="accent-bar" style={{ marginTop: 20 }} />
          <h1>{t('landing.title')}</h1>
          <p>{t('landing.subtitle')}</p>
          <div className="row" style={{ marginTop: 28 }}>
            {isSignedIn ? (
              <a className="btn btn--primary" href="/app">
                {t('nav.app')}
              </a>
            ) : (
              <Link className="btn btn--primary" to="/login">
                {t('landing.getStarted')}
              </Link>
            )}
            <a className="btn btn--ghost" href="#how">
              {t('landing.learnMore')}
            </a>
          </div>
        </div>
      </section>

      <main>
        <div className="container stack">
          <div className="card">
            <h2>{t('landing.who.title')}</h2>
            <p className="lede">{t('landing.who.body')}</p>
          </div>

          <h2 id="how" style={{ marginTop: 8 }}>
            {t('landing.steps.title')}
          </h2>
          <div className="card-grid">
            {(['one', 'two', 'three'] as const).map((k, i) => (
              <div className="card" key={k}>
                <span className="badge">{i + 1}</span>
                <h3 style={{ marginTop: 12 }}>{t(`landing.steps.${k}.title`)}</h3>
                <p className="muted">{t(`landing.steps.${k}.body`)}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
