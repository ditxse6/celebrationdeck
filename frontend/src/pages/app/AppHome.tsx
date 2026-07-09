import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface Tournament {
  id: string;
  name: string;
  season: string;
}

const SEASONS = ['2026-27', '2025-26'];

export default function AppHome() {
  const { t } = useTranslation();
  const [tournaments, setTournaments] = useState<Tournament[]>([
    { id: 't1', name: 'Southeast 6 Regional', season: '2026-27' },
  ]);
  const [selectedId, setSelectedId] = useState<string | null>('t1');

  const addTournament = () => {
    const n = tournaments.length + 1;
    const created: Tournament = { id: `t${Date.now()}`, name: `Tournament ${n}`, season: SEASONS[0] };
    setTournaments((prev) => [...prev, created]);
    setSelectedId(created.id);
  };

  const selected = tournaments.find((x) => x.id === selectedId) ?? null;

  return (
    <main>
      <div className="container stack">
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <div>
            <h1 className="page-title">{t('app.title')}</h1>
            <p className="lede">{t('app.subtitle')}</p>
          </div>
          <button className="btn btn--secondary" onClick={addTournament}>
            + {t('app.newTournament')}
          </button>
        </div>

        <span className="mock-note">{t('common.mockup')}</span>

        <div className="card-grid">
          {tournaments.length === 0 && <p className="muted">{t('app.empty')}</p>}
          {tournaments.map((tour) => (
            <div className="card" key={tour.id}>
              <span className="badge">{tour.season}</span>
              <h3 style={{ marginTop: 12 }}>{tour.name}</h3>
              <button className="btn btn--primary" onClick={() => setSelectedId(tour.id)}>
                {t('app.openTournament')}
              </button>
            </div>
          ))}
        </div>

        {selected && <TournamentPanel key={selected.id} name={selected.name} />}
      </div>
    </main>
  );
}

function TournamentPanel({ name }: { name: string }) {
  const { t } = useTranslation();
  const [files, setFiles] = useState<string[]>([]);

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setFiles((prev) => [...prev, f.name]);
    e.target.value = '';
  };

  return (
    <div className="card stack" style={{ borderTop: '4px solid var(--orange-500)' }}>
      <h2>{name}</h2>

      <section>
        <h3>{t('app.upload.title')}</h3>
        <div className="card-grid">
          <UploadTile label={t('app.upload.results')} onPick={onPick} chooseLabel={t('app.upload.choose')} />
          <UploadTile label={t('app.upload.special')} onPick={onPick} chooseLabel={t('app.upload.choose')} />
          <UploadTile label={t('app.upload.assets')} onPick={onPick} chooseLabel={t('app.upload.choose')} />
        </div>
        {files.length > 0 && (
          <div style={{ marginTop: 12 }}>
            <strong>{t('app.upload.uploaded')}</strong>
            <ul>
              {files.map((f, i) => (
                <li key={`${f}-${i}`}>{f}</li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <section>
        <h3>{t('app.settings.title')}</h3>
        <p className="muted">{t('app.settings.note')}</p>
        <div className="card-grid">
          <div className="field">
            <label>Placeholder option A</label>
            <select disabled>
              <option>—</option>
            </select>
          </div>
          <div className="field">
            <label>Placeholder option B</label>
            <input disabled placeholder="—" />
          </div>
        </div>
      </section>

      <GenerateSimulation />
    </div>
  );
}

function UploadTile({
  label,
  chooseLabel,
  onPick,
}: {
  label: string;
  chooseLabel: string;
  onPick: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="card" style={{ background: 'var(--surface-alt)' }}>
      <label>{label}</label>
      <label className="btn btn--secondary" style={{ marginTop: 8 }}>
        {chooseLabel}
        <input type="file" onChange={onPick} style={{ display: 'none' }} />
      </label>
    </div>
  );
}

const STAGES = ['Reading results…', 'Matching challenges & levels…', 'Building slides…', 'Finishing up…'];

function GenerateSimulation() {
  const { t } = useTranslation();
  const [stage, setStage] = useState(-1);
  const [done, setDone] = useState(false);

  const run = () => {
    setDone(false);
    setStage(0);
    let i = 0;
    const tick = () => {
      i += 1;
      if (i < STAGES.length) {
        setStage(i);
        setTimeout(tick, 700);
      } else {
        setStage(-1);
        setDone(true);
      }
    };
    setTimeout(tick, 700);
  };

  return (
    <section>
      <h3>{t('app.generate.title')}</h3>
      <p className="muted">{t('app.generate.note')}</p>
      <button className="btn btn--primary" onClick={run} disabled={stage >= 0}>
        {t('app.generate.button')}
      </button>
      {stage >= 0 && (
        <p style={{ marginTop: 12 }}>
          <span className="badge badge--accent">{STAGES[stage]}</span>
        </p>
      )}
      {done && (
        <p style={{ marginTop: 12 }}>
          <span className="badge">✓ Simulated complete — real slideshow output comes in a later phase.</span>
        </p>
      )}
    </section>
  );
}
