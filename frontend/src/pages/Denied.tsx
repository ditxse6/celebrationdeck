import { useTranslation } from 'react-i18next';

export default function Denied() {
  const { t } = useTranslation();
  return (
    <main>
      <div className="container" style={{ maxWidth: 620 }}>
        <div className="card stack">
          <h1 className="page-title">{t('denied.title')}</h1>
          <p className="lede">{t('denied.body')}</p>
        </div>
      </div>
    </main>
  );
}
