export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export function notFound(message = 'Task not found') {
  return new HttpError(404, message);
}

export function badRequest(message) {
  return new HttpError(400, message);
}

export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export function errorHandler(err, req, res, next) {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: err.message });
  }
  if (err?.name === 'ValidationError') {
    return res.status(400).json({ error: err.message });
  }
  if (err?.name === 'CastError') {
    return res.status(404).json({ error: 'Task not found' });
  }
  if (err?.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Request body must be valid JSON' });
  }
  console.error('[api] unhandled error:', err);
  return res.status(500).json({ error: 'Internal server error' });
}
