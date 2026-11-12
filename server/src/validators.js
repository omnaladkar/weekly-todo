import { badRequest } from './errors.js';

export const PRIORITIES = ['low', 'medium', 'high'];
export const STATUSES = ['in_progress', 'completed'];

const LIMITS = {
  title: 120,
  description: 1000,
  search: 120,
};

function parseDueAt(value) {
  if (value === undefined || value === null || value === '') {
    throw badRequest('date & time is required');
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw badRequest('date & time must be a valid date');
  }
  return date.toISOString();
}

function parseTitle(value) {
  if (typeof value !== 'string' || !value.trim()) {
    throw badRequest('title is required');
  }
  const title = value.trim();
  if (title.length > LIMITS.title) {
    throw badRequest(`title must be at most ${LIMITS.title} characters`);
  }
  return title;
}

function parseDescription(value) {
  if (value === undefined || value === null) return '';
  if (typeof value !== 'string') {
    throw badRequest('description must be a string');
  }
  const description = value.trim();
  if (description.length > LIMITS.description) {
    throw badRequest(`description must be at most ${LIMITS.description} characters`);
  }
  return description;
}

function parsePriority(value) {
  if (value === undefined || value === null || value === '') return undefined;
  if (!PRIORITIES.includes(value)) {
    throw badRequest('priority must be one of low, medium, high');
  }
  return value;
}

function parseStatus(value) {
  if (!STATUSES.includes(value)) {
    throw badRequest('status must be one of in_progress, completed');
  }
  return value;
}

export function parseCreateTask(body = {}) {
  return {
    title: parseTitle(body.title),
    description: parseDescription(body.description),
    dueAt: parseDueAt(body.dueAt),
    priority: parsePriority(body.priority) || 'medium',
    status: body.status === undefined ? 'in_progress' : parseStatus(body.status),
  };
}

export function parseUpdateTask(body = {}) {
  const patch = {};
  if (body.title !== undefined) patch.title = parseTitle(body.title);
  if (body.description !== undefined) patch.description = parseDescription(body.description);
  if (body.dueAt !== undefined) patch.dueAt = parseDueAt(body.dueAt);
  if (body.priority !== undefined) {
    patch.priority = parsePriority(body.priority) || 'medium';
  }
  if (body.status !== undefined) patch.status = parseStatus(body.status);

  if (Object.keys(patch).length === 0) {
    throw badRequest('provide at least one field to update');
  }
  return patch;
}

export function parseSearchQuery(value) {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, LIMITS.search);
}
