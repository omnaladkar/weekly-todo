import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const here = path.dirname(fileURLToPath(import.meta.url));
const isServerless = Boolean(
  process.env.NETLIFY || process.env.AWS_LAMBDA_FUNCTION_NAME
);

dotenv.config({ path: path.resolve(here, '..', '.env') });

export const config = {
  port: Number(process.env.PORT || 5000),
  mongoUri: (process.env.MONGODB_URI || '').trim(),
  clientOrigin: (process.env.CLIENT_ORIGIN || '*').trim(),
  dataDir: process.env.DATA_DIR
    ? path.resolve(process.env.DATA_DIR)
    : isServerless
      ? path.join(os.tmpdir(), 'weekly-todo-data')
      : path.resolve(here, '..', 'data'),
};
