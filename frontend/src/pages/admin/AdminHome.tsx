import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface Season {
  displayYear: string;
  endYear: number;
}
interface AccessRequest {
  identityProvider: string;
  userId: string;
  name: string;
  org: string;
  role: string;
  notes: string;
  userDetails: string;
}

export default function AdminHome() {
  const { t } = useTranslation();
  const [seasons, setSeasons] = useState<Season[]>([{ displayYear: '2026-27', endYear: 2027 }]);
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/access-requests');
      if (!res.ok) throw new Error(`load failed (${res.status})`);
      const data = (await res.json()) as { requests: AccessRequest[] };
      setRequests(data.requests ?? []);
    } catch {
      setError(t('admin.approvals.loadError'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void loadRequests();
  }, [loadRequests]);

  const addSeason = () => {
    const nextEnd = Math.max(...seasons.map((s) => s.endYear)) + 1;
    const display = `${nextEnd - 1}-${String(nextEnd).slice(-2)}`;
    setSeasons((prev) => [{ displayYear: display, endYear: nextEnd }, ...prev]);
  };

  const decide = async (r: AccessRequest, decision: 'approve' | 'deny') => {
    setBusy(r.userId);
    setError(null);
    try {
      const res = await fetch('/api/access-decision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identityProvider: r.identityProvider, userId: r.userId, decision }),
      });
      if (!res.ok) throw new Error(`decision failed (${res.status})`);
      setRequests((prev) => prev.filter((x) => x.userId !== r.userId));
    } catch {
      setError(t('admin.approvals.decisionError'));
    } finally {
      setBusy(null);
    }
  };

  return (
    <main>
      <div className="container stack">
        <div>
          <h1 className="page-title">{t('admin.title')}</h1>
          <p className="lede">{t('admin.subtitle')}</p>
        </div>

        <div className="card stack">
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <h2 style={{ margin: 0 }}>{t('admin.seasons.title')}</h2>
            <button className="btn btn--secondary" onClick={addSeason}>
              + {t('admin.seasons.new')}
            </button>
          </div>
          <span className="mock-note">{t('common.mockup')}</span>
          <p className="muted">{t('admin.seasons.note')}</p>
          <div className="card-grid">
            {seasons.map((s) => (
              <div className="card" key={s.endYear} style={{ background: 'var(--surface-alt)' }}>
                <span className="badge badge--accent">{s.displayYear}</span>
                <p className="muted" style={{ marginTop: 8 }}>
                  internal key: {s.endYear}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="card stack">
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <h2 style={{ margin: 0 }}>{t('admin.approvals.title')}</h2>
            <button className="btn btn--ghost" onClick={() => void loadRequests()} disabled={loading}>
              {t('admin.approvals.refresh')}
            </button>
          </div>
          <p className="muted">{t('admin.approvals.effectNote')}</p>
          {error && <p style={{ color: 'var(--orange-600)' }}>{error}</p>}
          {loading && <p className="muted">{t('common.loading')}</p>}
          {!loading && requests.length === 0 && <p className="muted">{t('admin.approvals.empty')}</p>}
          {requests.map((r) => (
            <div className="row" key={`${r.identityProvider}:${r.userId}`} style={{ justifyContent: 'space-between' }}>
              <div>
                <strong>{r.name || r.userDetails || t('admin.approvals.unnamed')}</strong>
                {r.org && <span className="muted"> — {r.org}</span>}
                {r.role && <div className="muted" style={{ fontSize: '0.9rem' }}>{r.role}</div>}
                {r.notes && <div className="muted" style={{ fontSize: '0.9rem' }}>{r.notes}</div>}
              </div>
              <div className="row">
                <button className="btn btn--primary" disabled={busy === r.userId} onClick={() => void decide(r, 'approve')}>
                  {t('admin.approvals.approve')}
                </button>
                <button
                  className="btn btn--ghost"
                  style={{ color: 'var(--purple-700)', borderColor: 'var(--line)' }}
                  disabled={busy === r.userId}
                  onClick={() => void decide(r, 'deny')}
                >
                  {t('admin.approvals.deny')}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
