import { app, type HttpRequest, type HttpResponseInit, type InvocationContext } from '@azure/functions';
import { getClientPrincipal, getUser, usersTableClient } from '../shared/users';

interface DecisionBody {
  identityProvider?: string;
  userId?: string;
  decision?: 'approve' | 'deny';
}

/** Admin-only: approve or deny a pending user. Takes effect on that user's next login. */
export async function accessDecision(
  request: HttpRequest,
  context: InvocationContext,
): Promise<HttpResponseInit> {
  const principal = getClientPrincipal(request);
  if (!principal?.userRoles?.includes('admin')) {
    return { status: 403, jsonBody: { error: 'admin only' } };
  }

  let body: DecisionBody = {};
  try {
    body = (await request.json()) as DecisionBody;
  } catch {
    /* handled below */
  }

  if (!body.identityProvider || !body.userId || (body.decision !== 'approve' && body.decision !== 'deny')) {
    return { status: 400, jsonBody: { error: 'identityProvider, userId and decision (approve|deny) are required' } };
  }

  const client = usersTableClient();
  try {
    const existing = await getUser(client, body.identityProvider, body.userId);
    if (!existing) return { status: 404, jsonBody: { error: 'user not found' } };

    const status = body.decision === 'approve' ? 'approved' : 'denied';
    await client.updateEntity(
      {
        partitionKey: body.identityProvider,
        rowKey: body.userId,
        status,
        decidedAt: new Date().toISOString(),
        decidedBy: principal.userDetails ?? '',
      },
      'Merge',
    );
    return { jsonBody: { status } };
  } catch (err) {
    context.error('accessDecision: update failed', err);
    return { status: 500, jsonBody: { error: 'could not update user' } };
  }
}

app.http('accessDecision', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'access-decision',
  handler: accessDecision,
});
