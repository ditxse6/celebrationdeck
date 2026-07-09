import { app, type HttpRequest, type HttpResponseInit, type InvocationContext } from '@azure/functions';

/**
 * Body Azure Static Web Apps POSTs to the `auth.rolesSource` endpoint after a
 * successful login. We return the custom roles to assign to the user.
 * See: https://learn.microsoft.com/azure/static-web-apps/assign-roles-microsoft-graph
 */
interface RolesRequest {
  identityProvider?: string;
  userId?: string;
  userDetails?: string;
  claims?: unknown[];
  accessToken?: string;
}

export async function rolesSource(
  request: HttpRequest,
  context: InvocationContext,
): Promise<HttpResponseInit> {
  let body: RolesRequest = {};
  try {
    body = (await request.json()) as RolesRequest;
  } catch {
    context.warn('rolesSource: request body was not valid JSON');
  }

  const adminIds = (process.env.ADMIN_USER_IDS ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const roles: string[] = [];

  // Admin bootstrap: admin user ids come from an app setting (never committed).
  if (body.userId && adminIds.includes(body.userId)) {
    roles.push('admin', 'approved');
  }

  // TODO (Workstream 4): look the user up in Table Storage and assign
  // 'approved' | 'pending' | 'denied' based on their access-request status.
  // For now, non-admins receive no custom roles (treated as "unregistered").

  return { jsonBody: { roles } };
}

app.http('rolesSource', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'roles',
  handler: rolesSource,
});
