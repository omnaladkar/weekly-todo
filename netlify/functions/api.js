import serverless from 'serverless-http';
import { app } from '../../server/src/app.js';

const serverlessHandler = serverless(app);

export async function handler(event, context) {
  const originalPath = event.path || '';
  event.path = originalPath
    .replace('/.netlify/functions/api', '/api')
    .replace(/^\/api\/?$/, '/api/health');
  if (event.rawUrl) {
    event.rawUrl = event.rawUrl.replace('/.netlify/functions/api', '/api');
  }
  return serverlessHandler(event, context);
}
