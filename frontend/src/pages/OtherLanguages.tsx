import { useTranslation } from 'react-i18next';
import { REPO_URL } from '../config';

/** Public, no-auth placeholder page inviting volunteer translators. */
export default function OtherLanguages() {
  const { t } = useTranslation();
  return (
    <main>
      <div className="container" style={{ maxWidth: 720 }}>
        <span className="mock-note">{t('common.mockup')}</span>
        <h1 className="page-title" style={{ marginTop: 16 }}>
          {t('otherLanguages.title')}
        </h1>
        <p className="lede">{t('otherLanguages.intro')}</p>
        <div className="card stack" style={{ marginTop: 16 }}>
          <h2>{t('otherLanguages.howTitle')}</h2>
          <p>{t('otherLanguages.how')}</p>
          <p className="muted">{t('otherLanguages.placeholderNote')}</p>
          <p>
            <a className="btn btn--secondary" href={REPO_URL} target="_blank" rel="noopener noreferrer">
              {t('otherLanguages.openRepo')}
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}
