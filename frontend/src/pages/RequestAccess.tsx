import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function RequestAccess() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    // Mockup: no request is actually written yet (see Workstream 4).
    setTimeout(() => navigate('/pending'), 400);
  };

  return (
    <main>
      <div className="container" style={{ maxWidth: 620 }}>
        <span className="mock-note">{t('common.mockup')}</span>
        <h1 className="page-title" style={{ marginTop: 16 }}>
          {t('requestAccess.title')}
        </h1>
        <p className="lede">{t('requestAccess.body')}</p>
        <form className="card" onSubmit={onSubmit} style={{ marginTop: 20 }}>
          <div className="field">
            <label htmlFor="name">{t('requestAccess.nameLabel')}</label>
            <input id="name" name="name" required />
          </div>
          <div className="field">
            <label htmlFor="org">{t('requestAccess.orgLabel')}</label>
            <input id="org" name="org" required />
          </div>
          <div className="field">
            <label htmlFor="role">{t('requestAccess.roleLabel')}</label>
            <input id="role" name="role" />
          </div>
          <div className="field">
            <label htmlFor="notes">{t('requestAccess.notesLabel')}</label>
            <textarea id="notes" name="notes" rows={3} />
          </div>
          <button className="btn btn--primary" type="submit" disabled={submitting}>
            {t('requestAccess.submit')}
          </button>
        </form>
      </div>
    </main>
  );
}
