import fs from 'node:fs';
import path from 'node:path';
import cors from 'cors';
import express from 'express';
import { config } from './config.js';
import { errorHandler } from './errors.js';
import { getRepository } from './repository/index.js';
import { tasksRouter } from './routes/tasks.js';

function corsOrigin() {
  if (!config.clientOrigin || config.clientOrigin === '*') return '*';
  return config.clientOrigin
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

export function createApp(repo) {
  const app = express();

  app.disable('x-powered-by');
  app.use(cors({ origin: corsOrigin() }));
  app.use(express.json({ limit: '200kb' }));

  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      store: config.mongoUri ? 'mongodb' : 'file',
      time: new Date().toISOString(),
    });
  });

  app.use('/api/tasks', tasksRouter(repo));

  if (config.serveClient && fs.existsSync(config.clientDist)) {
    app.use(express.static(config.clientDist, { index: false, maxAge: '1h' }));
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api')) return next();
      res.sendFile(path.join(config.clientDist, 'index.html'));
    });
  }

  app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
  });

  app.use(errorHandler);
  return app;
}

const lazyRepository = {
  list: (...args) => getRepository().then((repo) => repo.list(...args)),
  get: (...args) => getRepository().then((repo) => repo.get(...args)),
  create: (...args) => getRepository().then((repo) => repo.create(...args)),
  update: (...args) => getRepository().then((repo) => repo.update(...args)),
  remove: (...args) => getRepository().then((repo) => repo.remove(...args)),
};

export const app = createApp(lazyRepository);
