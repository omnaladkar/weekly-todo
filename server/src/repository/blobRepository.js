import crypto from 'node:crypto';
import { get, put } from '@vercel/blob';

const PATHNAME = 'weekly-todo/tasks.json';

const blobOptions = {
  access: 'private',
  addRandomSuffix: false,
  allowOverwrite: true,
  contentType: 'application/json',
  cacheControlMaxAge: 60,
};

async function readAll() {
  const result = await get(PATHNAME, { access: 'private', useCache: false });
  if (!result || !result.stream) return [];
  const text = await new Response(result.stream).text();
  if (!text) return [];
  const parsed = JSON.parse(text);
  return Array.isArray(parsed) ? parsed : [];
}

async function writeAll(tasks) {
  await put(PATHNAME, JSON.stringify(tasks), blobOptions);
}

export async function createBlobRepository() {
  let queue = Promise.resolve();

  function mutate(fn) {
    const run = queue.then(async () => {
      const tasks = await readAll();
      const result = await fn(tasks);
      await writeAll(tasks);
      return result;
    });
    queue = run.then(
      () => undefined,
      () => undefined
    );
    return run;
  }

  const byDueDate = (a, b) =>
    new Date(a.dueAt) - new Date(b.dueAt) || a.createdAt.localeCompare(b.createdAt);

  return {
    kind: 'blob',

    async list(query = '') {
      const tasks = await readAll();
      const needle = query.toLowerCase();
      return tasks
        .filter(
          (task) =>
            !needle ||
            task.title.toLowerCase().includes(needle) ||
            (task.description || '').toLowerCase().includes(needle)
        )
        .sort(byDueDate);
    },

    async get(id) {
      const tasks = await readAll();
      return tasks.find((task) => task.id === id) || null;
    },

    async create(data) {
      return mutate((tasks) => {
        const now = new Date().toISOString();
        const task = {
          id: crypto.randomUUID(),
          ...data,
          createdAt: now,
          updatedAt: now,
        };
        tasks.push(task);
        return task;
      });
    },

    async update(id, patch) {
      return mutate((tasks) => {
        const index = tasks.findIndex((task) => task.id === id);
        if (index === -1) return null;
        const task = {
          ...tasks[index],
          ...patch,
          updatedAt: new Date().toISOString(),
        };
        tasks[index] = task;
        return task;
      });
    },

    async remove(id) {
      return mutate((tasks) => {
        const index = tasks.findIndex((task) => task.id === id);
        if (index === -1) return null;
        return tasks.splice(index, 1)[0];
      });
    },
  };
}
