import { app, type HttpRequest, type HttpResponseInit, type InvocationContext } from '@azure/functions';
import { getClientPrincipal, getUser, isAdmin, usersTableClient } from '../shared/users';

interface AccessRequestBody {
  name?: string;
  org?: string;
  role?: string;
  notes?: string;
}

/**
 * A signed-in but unapproved user submits their access request here. Creates or
 * updates their `users` row as `pending` (unless already approved). The role
 * only takes effect on their next login, when rolesSource runs again.
 */
export async function accessRequest(
  request: HttpRequest,
  context: InvocationContext,
): Promise<HttpResponseInit> {
  const principal = getClientPrincipal(request);
  if (!principal) return { status: 401, jsonBody: { error: 'not authenticated' } };

  // Admins are implicitly approved; nothing to request.
  if (isAdmin(principal)) return { jsonBody: { status: 'approved' } };

  let body: AccessRequestBody = {};
  try {
    body = (await request.json()) as AccessRequestBody;
  } catch {
    /* empty body is fine */
  }

  const client = usersTableClient();

  try {
    const existing = await getUser(client, principal.identityProvider, principal.userId);
    if (existing?.status === 'approved') return { jsonBody: { status: 'approved' } };

    const now = new Date().toISOString();
    await client.upsertEntity(
      {
        partitionKey: principal.identityProvider,
        rowKey: principal.userId,
        status: 'pending',
        userDetails: principal.userDetails ?? '',
        name: (body.name ?? '').slice(0, 200),
        org: (body.org ?? '').slice(0, 200),
        roleText: (body.role ?? '').slice(0, 200),
        notes: (body.notes ?? '').slice(0, 2000),
        requestedAt: existing?.requestedAt ?? now,
      },
      'Merge',
    );
    return { jsonBody: { status: 'pending' } };
  } catch (err) {
    context.error('accessRequest: failed to write request', err);
    return { status: 500, jsonBody: { error: 'could not save request' } };
  }
}

app.http('accessRequest', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'access-request',
  handler: accessRequest,
});
