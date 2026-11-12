import crypto from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';

const FILE_NAME = 'tasks.json';

export async function createFileRepository(dir) {
  const file = path.join(dir, FILE_NAME);
  let queue = Promise.resolve();

  async function readAll() {
    try {
      const raw = await fs.readFile(file, 'utf8');
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      if (err.code === 'ENOENT') return [];
      throw err;
    }
  }

  async function writeAll(tasks) {
    await fs.mkdir(dir, { recursive: true });
    const tmp = `${file}.${process.pid}.${Date.now()}.tmp`;
    await fs.writeFile(tmp, JSON.stringify(tasks, null, 2), 'utf8');
    await fs.rename(tmp, file);
  }

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
    kind: 'file',

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
