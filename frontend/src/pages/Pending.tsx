import { useTranslation } from 'react-i18next';

export default function Pending() {
  const { t } = useTranslation();
  return (
    <main>
      <div className="container" style={{ maxWidth: 620 }}>
        <div className="card stack">
          <span className="badge">{t('pending.title')}</span>
          <h1 className="page-title">{t('pending.title')}</h1>
          <p className="lede">{t('pending.body')}</p>
        </div>
      </div>
    </main>
  );
}
