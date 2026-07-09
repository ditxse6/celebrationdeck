import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

/** Client principal shape returned by Azure Static Web Apps at /.auth/me. */
export interface ClientPrincipal {
  identityProvider: string;
  userId: string;
  userDetails: string;
  userRoles: string[];
}

/**
 * Access status derived from the user's roles.
 * Roles beyond the SWA built-ins ("anonymous", "authenticated") are assigned
 * by the rolesSource Function once the account is reviewed.
 */
export type AccessStatus =
  | 'anonymous' // not signed in
  | 'unregistered' // signed in, no access record yet -> should request access
  | 'pending'
  | 'denied'
  | 'approved'
  | 'admin';

/** SWA login provider route names configured in staticwebapp.config.json. */
export type LoginProvider = 'aad' | 'google';

const DEV_ROLE_KEY = 'celebrationdeck.devRole';

interface AuthState {
  loading: boolean;
  principal: ClientPrincipal | null;
  status: AccessStatus;
  roles: string[];
  login: (provider?: LoginProvider, redirectTo?: string) => void;
  logout: () => void;
  /** Dev-only: simulate a role/status locally without a real SWA login. */
  devRole: string | null;
  setDevRole: (role: string | null) => void;
  isDev: boolean;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

function deriveStatus(principal: ClientPrincipal | null): AccessStatus {
  if (!principal) return 'anonymous';
  const roles = principal.userRoles ?? [];
  if (roles.includes('admin')) return 'admin';
  if (roles.includes('approved')) return 'approved';
  if (roles.includes('denied')) return 'denied';
  if (roles.includes('pending')) return 'pending';
  return 'unregistered';
}

/** Build a simulated principal for local mockup navigation. */
function devPrincipal(role: string | null): ClientPrincipal | null {
  if (!role || role === 'anonymous') return null;
  const baseRoles = ['anonymous', 'authenticated'];
  const extra = role === 'unregistered' ? [] : [role];
  return {
    identityProvider: 'dev',
    userId: 'dev-user',
    userDetails: 'dev@example.com',
    userRoles: [...baseRoles, ...extra],
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const isDev = import.meta.env.DEV;
  const [loading, setLoading] = useState(true);
  const [principal, setPrincipal] = useState<ClientPrincipal | null>(null);
  const [devRole, setDevRoleState] = useState<string | null>(() =>
    isDev ? localStorage.getItem(DEV_ROLE_KEY) : null,
  );

  const loadPrincipal = useCallback(async () => {
    // In dev with a simulated role selected, skip the network call.
    if (isDev && devRole !== null) {
      setPrincipal(devPrincipal(devRole));
      setLoading(false);
      return;
    }
    try {
      const res = await fetch('/.auth/me');
      if (!res.ok) throw new Error(`/.auth/me responded ${res.status}`);
      const data = (await res.json()) as { clientPrincipal: ClientPrincipal | null };
      setPrincipal(data.clientPrincipal ?? null);
    } catch {
      // /.auth/me is unavailable outside SWA (e.g. plain `vite dev`): treat as anonymous.
      setPrincipal(null);
    } finally {
      setLoading(false);
    }
  }, [isDev, devRole]);

  useEffect(() => {
    void loadPrincipal();
  }, [loadPrincipal]);

  const setDevRole = useCallback(
    (role: string | null) => {
      if (!isDev) return;
      if (role === null) localStorage.removeItem(DEV_ROLE_KEY);
      else localStorage.setItem(DEV_ROLE_KEY, role);
      setDevRoleState(role);
    },
    [isDev],
  );

  const login = useCallback((provider: LoginProvider = 'aad', redirectTo = '/app') => {
    const target = encodeURIComponent(redirectTo);
    window.location.href = `/.auth/login/${provider}?post_login_redirect_uri=${target}`;
  }, []);

  const logout = useCallback(() => {
    if (isDev && devRole !== null) {
      setDevRole(null);
      return;
    }
    window.location.href = '/.auth/logout?post_logout_redirect_uri=/';
  }, [isDev, devRole, setDevRole]);

  const value = useMemo<AuthState>(
    () => ({
      loading,
      principal,
      status: deriveStatus(principal),
      roles: principal?.userRoles ?? [],
      login,
      logout,
      devRole,
      setDevRole,
      isDev,
    }),
    [loading, principal, login, logout, devRole, setDevRole, isDev],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
