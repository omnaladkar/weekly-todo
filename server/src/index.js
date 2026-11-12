import { app } from './app.js';
import { config } from './config.js';
import { getRepository } from './repository/index.js';

async function start() {
  const repo = await getRepository();
  app.listen(config.port, () => {
    console.log(`API ready on http://localhost:${config.port}`);
    console.log(`Storage: ${repo.kind === 'mongo' ? 'MongoDB' : 'local JSON file'}`);
  });
}

start().catch((err) => {
  console.error('Failed to start the API:', err.message);
  process.exit(1);
});
