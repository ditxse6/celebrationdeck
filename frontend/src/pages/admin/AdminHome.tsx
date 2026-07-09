import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface Season {
  displayYear: string;
  endYear: number;
}
interface AccessRequest {
  id: string;
  name: string;
  org: string;
}

export default function AdminHome() {
  const { t } = useTranslation();
  const [seasons, setSeasons] = useState<Season[]>([{ displayYear: '2026-27', endYear: 2027 }]);
  const [requests, setRequests] = useState<AccessRequest[]>([
    { id: 'r1', name: 'Jane Organizer', org: 'Region 12' },
    { id: 'r2', name: 'Sam Coordinator', org: 'State Affiliate' },
  ]);

  const addSeason = () => {
    const nextEnd = Math.max(...seasons.map((s) => s.endYear)) + 1;
    const display = `${nextEnd - 1}-${String(nextEnd).slice(-2)}`;
    setSeasons((prev) => [{ displayYear: display, endYear: nextEnd }, ...prev]);
  };

  const resolve = (id: string) => setRequests((prev) => prev.filter((r) => r.id !== id));

  return (
    <main>
      <div className="container stack">
        <div>
          <h1 className="page-title">{t('admin.title')}</h1>
          <p className="lede">{t('admin.subtitle')}</p>
        </div>
        <span className="mock-note">{t('common.mockup')}</span>

        <div className="card stack">
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <h2 style={{ margin: 0 }}>{t('admin.seasons.title')}</h2>
            <button className="btn btn--secondary" onClick={addSeason}>
              + {t('admin.seasons.new')}
            </button>
          </div>
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
          <h2 style={{ margin: 0 }}>{t('admin.approvals.title')}</h2>
          {requests.length === 0 && <p className="muted">{t('admin.approvals.empty')}</p>}
          {requests.map((r) => (
            <div className="row" key={r.id} style={{ justifyContent: 'space-between' }}>
              <div>
                <strong>{r.name}</strong>
                <span className="muted"> — {r.org}</span>
              </div>
              <div className="row">
                <button className="btn btn--primary" onClick={() => resolve(r.id)}>
                  {t('admin.approvals.approve')}
                </button>
                <button className="btn btn--ghost" style={{ color: 'var(--purple-700)', borderColor: 'var(--line)' }} onClick={() => resolve(r.id)}>
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
