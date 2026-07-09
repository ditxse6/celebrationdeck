import { useAuth } from '../auth/auth';

const ROLES = ['anonymous', 'unregistered', 'pending', 'denied', 'approved', 'admin'] as const;

/**
 * Dev-only control to simulate access states so the mockup is clickable
 * without a real Static Web Apps login. Hidden in production builds.
 */
export default function DevRoleSwitcher() {
  const { isDev, devRole, setDevRole } = useAuth();
  if (!isDev) return null;

  return (
    <label
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        margin: 0,
        color: 'rgba(255,255,255,0.85)',
        fontSize: '0.8rem',
        fontWeight: 600,
      }}
    >
      dev role
      <select
        aria-label="Simulated role (dev only)"
        value={devRole ?? 'anonymous'}
        onChange={(e) => setDevRole(e.target.value === 'anonymous' ? null : e.target.value)}
        style={{ width: 'auto', padding: '4px 8px', borderRadius: 8 }}
      >
        {ROLES.map((r) => (
          <option key={r} value={r}>
            {r}
          </option>
        ))}
      </select>
    </label>
  );
}
