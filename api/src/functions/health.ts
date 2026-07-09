import { app, type HttpResponseInit } from '@azure/functions';

export async function health(): Promise<HttpResponseInit> {
  return { jsonBody: { status: 'ok', service: 'celebrationdeck-api' } };
}

app.http('health', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'health',
  handler: health,
});
