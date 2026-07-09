import { app, type HttpRequest, type HttpResponseInit, type InvocationContext } from '@azure/functions';
import { getUser, isAdmin, usersTableClient, type ClientPrincipal } from '../shared/users';

/**
 * Azure Static Web Apps POSTs the signed-in user to this endpoint (configured as
 * `auth.rolesSource`) after each successful login, and assigns whatever custom
 * roles we return. The payload has identityProvider/userId/userDetails/claims at
 * the body root (no wrapper). Built-in roles (anonymous/authenticated) are added
 * by the platform — we only return custom roles.
 *
 * Role model:
 *   - admin: bootstrapped by Entra object id (oid claim) via ADMIN_ENTRA_OID.
 *   - approved / pending / denied: looked up in the `users` table by
 *     (identityProvider, userId). No record => no custom role (unregistered).
 */
export async function rolesSource(
  request: HttpRequest,
  context: InvocationContext,
): Promise<HttpResponseInit> {
  let body: ClientPrincipal;
  try {
    body = (await request.json()) as ClientPrincipal;
  } catch {
    context.warn('rolesSource: request body was not valid JSON');
    return { jsonBody: { roles: [] } };
  }

  // Admin bootstrap first — never touches storage, so admins get in even if
  // Table Storage is unavailable.
  if (isAdmin(body)) {
    return { jsonBody: { roles: ['admin', 'approved'] } };
  }

  if (!body.identityProvider || !body.userId) {
    return { jsonBody: { roles: [] } };
  }

  try {
    const record = await getUser(usersTableClient(), body.identityProvider, body.userId);
    if (record?.status === 'approved') return { jsonBody: { roles: ['approved'] } };
    if (record?.status === 'pending') return { jsonBody: { roles: ['pending'] } };
    if (record?.status === 'denied') return { jsonBody: { roles: ['denied'] } };
  } catch (err) {
    // Fail closed: on storage error, grant no elevated roles (user simply can't
    // access gated areas), rather than blocking login entirely.
    context.error('rolesSource: user lookup failed', err);
  }

  return { jsonBody: { roles: [] } };
}

app.http('rolesSource', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'roles',
  handler: rolesSource,
});
