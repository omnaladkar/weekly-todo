import { Router } from 'express';
import { asyncHandler, notFound } from '../errors.js';
import { parseCreateTask, parseSearchQuery, parseUpdateTask } from '../validators.js';

export function tasksRouter(repo) {
  const router = Router();

  router.get(
    '/',
    asyncHandler(async (req, res) => {
      const query = parseSearchQuery(req.query.q);
      const tasks = await repo.list(query);
      res.json({ data: tasks });
    })
  );

  router.post(
    '/',
    asyncHandler(async (req, res) => {
      const task = await repo.create(parseCreateTask(req.body));
      res.status(201).json({ data: task });
    })
  );

  router.get(
    '/:id',
    asyncHandler(async (req, res) => {
      const task = await repo.get(req.params.id);
      if (!task) throw notFound();
      res.json({ data: task });
    })
  );

  router.patch(
    '/:id',
    asyncHandler(async (req, res) => {
      const task = await repo.update(req.params.id, parseUpdateTask(req.body));
      if (!task) throw notFound();
      res.json({ data: task });
    })
  );

  router.delete(
    '/:id',
    asyncHandler(async (req, res) => {
      const task = await repo.remove(req.params.id);
      if (!task) throw notFound();
      res.json({ data: task });
    })
  );

  return router;
}
