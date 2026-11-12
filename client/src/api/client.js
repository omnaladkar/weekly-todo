const BASE_URL = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');

async function request(path, options = {}) {
  let response;

  try {
    response = await fetch(`${BASE_URL}${path}`, {
      headers: { 'Content-Type': 'application/json', ...options.headers },
      ...options,
    });
  } catch {
    throw new Error('Cannot reach the server. Check your connection and try again.');
  }

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(body?.error || 'Something went wrong. Please try again.');
  }

  return body?.data;
}

export const tasksApi = {
  list(query = '') {
    const suffix = query ? `?q=${encodeURIComponent(query)}` : '';
    return request(`/tasks${suffix}`);
  },

  create(payload) {
    return request('/tasks', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  update(id, payload) {
    return request(`/tasks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  remove(id) {
    return request(`/tasks/${id}`, { method: 'DELETE' });
  },
};
