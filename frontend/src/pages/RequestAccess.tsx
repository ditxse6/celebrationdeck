import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function RequestAccess() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch('/api/access-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.get('name'),
          org: form.get('org'),
          role: form.get('role'),
          notes: form.get('notes'),
        }),
      });
      if (!res.ok) throw new Error(`request failed (${res.status})`);
      const data = (await res.json()) as { status?: string };
      navigate(data.status === 'approved' ? '/app' : '/pending');
    } catch {
      setError(t('requestAccess.error'));
      setSubmitting(false);
    }
  };

  return (
    <main>
      <div className="container" style={{ maxWidth: 620 }}>
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
          {error && (
            <p className="muted" style={{ color: 'var(--orange-600)' }}>
              {error}
            </p>
          )}
          <button className="btn btn--primary" type="submit" disabled={submitting}>
            {t('requestAccess.submit')}
          </button>
        </form>
      </div>
    </main>
  );
}
