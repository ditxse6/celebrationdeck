import { app, type HttpRequest, type HttpResponseInit, type InvocationContext } from '@azure/functions';
import { getClientPrincipal, listPendingUsers, usersTableClient } from '../shared/users';

/** Admin-only: list pending access requests for review. */
export async function accessRequests(
  request: HttpRequest,
  context: InvocationContext,
): Promise<HttpResponseInit> {
  const principal = getClientPrincipal(request);
  if (!principal?.userRoles?.includes('admin')) {
    return { status: 403, jsonBody: { error: 'admin only' } };
  }

  try {
    const rows = await listPendingUsers(usersTableClient());
    const requests = rows.map((r) => ({
      identityProvider: r.partitionKey,
      userId: r.rowKey,
      name: r.name ?? '',
      org: r.org ?? '',
      role: r.roleText ?? '',
      notes: r.notes ?? '',
      userDetails: r.userDetails ?? '',
      requestedAt: r.requestedAt ?? '',
    }));
    return { jsonBody: { requests } };
  } catch (err) {
    context.error('accessRequests: list failed', err);
    return { status: 500, jsonBody: { error: 'could not list requests' } };
  }
}

app.http('accessRequests', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'access-requests',
  handler: accessRequests,
});
