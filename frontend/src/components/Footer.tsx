import { Trans, useTranslation } from 'react-i18next';
import { AUTHOR_EMAIL, REGION_URL, REPO_URL } from '../config';

export default function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="footer">
      <div className="container">
        <p className="attribution">
          <Trans
            i18nKey="footer.createdBy"
            components={[<a key="email" href={`mailto:${AUTHOR_EMAIL}`} />]}
          />{' '}
          &middot;{' '}
          <Trans
            i18nKey="footer.region"
            components={[
              <a key="region" href={REGION_URL} target="_blank" rel="noopener noreferrer" />,
            ]}
          />
        </p>
        <p>
          <a href={REPO_URL} target="_blank" rel="noopener noreferrer">
            {t('footer.source')}
          </a>
        </p>
        <p className="disclaimer">{t('footer.disclaimer')}</p>
      </div>
    </footer>
  );
}
