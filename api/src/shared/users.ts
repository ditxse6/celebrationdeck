import { TableClient, odata } from '@azure/data-tables';
import type { HttpRequest } from '@azure/functions';

/** Access-request lifecycle status stored per user. Admins aren't stored here. */
export type UserStatus = 'pending' | 'approved' | 'denied';

/** A row in the `users` table. Keyed by (identityProvider, userId). */
export interface UserRecord {
  partitionKey: string; // identityProvider, e.g. "aad" | "google"
  rowKey: string; // SWA userId (stable per user per app)
  status: UserStatus;
  userDetails?: string; // email / username from the provider
  name?: string;
  org?: string;
  roleText?: string;
  notes?: string;
  requestedAt?: string;
  decidedAt?: string;
  decidedBy?: string;
}

/** Claim as delivered in the SWA client principal / rolesSource payload. */
export interface PrincipalClaim {
  typ: string;
  val: string;
}

/** Shape SWA provides both to the rolesSource endpoint and via the
 * x-ms-client-principal header (base64 JSON). */
export interface ClientPrincipal {
  identityProvider: string;
  userId: string;
  userDetails: string;
  userRoles?: string[];
  claims?: PrincipalClaim[];
}

export function usersTableClient(): TableClient {
  const conn = process.env.STORAGE_CONNECTION_STRING;
  if (!conn) throw new Error('STORAGE_CONNECTION_STRING is not configured');
  const tableName = process.env.TABLE_USERS || 'users';
  return TableClient.fromConnectionString(conn, tableName);
}

/** Decode the x-ms-client-principal header SWA injects into authenticated API calls. */
export function getClientPrincipal(request: HttpRequest): ClientPrincipal | null {
  const header = request.headers.get('x-ms-client-principal');
  if (!header) return null;
  try {
    const decoded = Buffer.from(header, 'base64').toString('utf8');
    return JSON.parse(decoded) as ClientPrincipal;
  } catch {
    return null;
  }
}

/** Collect the identifiers we're willing to match an admin on: the Entra
 * object id (oid) claim, the SWA userId, and the nameidentifier claim. */
export function candidateIds(p: {
  userId?: string;
  claims?: PrincipalClaim[];
}): string[] {
  const ids = new Set<string>();
  if (p.userId) ids.add(p.userId.toLowerCase());
  for (const c of p.claims ?? []) {
    const typ = c.typ?.toLowerCase() ?? '';
    if (
      typ === 'oid' ||
      typ.endsWith('/objectidentifier') ||
      typ.endsWith('/nameidentifier')
    ) {
      if (c.val) ids.add(c.val.toLowerCase());
    }
  }
  return [...ids];
}

export function adminOids(): string[] {
  return (process.env.ADMIN_ENTRA_OID ?? '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

/** True if the given principal/identity matches a bootstrapped admin. */
export function isAdmin(p: { userId?: string; claims?: PrincipalClaim[] }): boolean {
  const admins = adminOids();
  if (admins.length === 0) return false;
  return candidateIds(p).some((id) => admins.includes(id));
}

export async function getUser(
  client: TableClient,
  identityProvider: string,
  userId: string,
): Promise<UserRecord | null> {
  try {
    return (await client.getEntity(identityProvider, userId)) as unknown as UserRecord;
  } catch (err) {
    if ((err as { statusCode?: number }).statusCode === 404) return null;
    throw err;
  }
}

export async function listPendingUsers(client: TableClient): Promise<UserRecord[]> {
  const results: UserRecord[] = [];
  const iter = client.listEntities<UserRecord>({
    queryOptions: { filter: odata`status eq 'pending'` },
  });
  for await (const e of iter) results.push(e);
  return results;
}
