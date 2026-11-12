import { useCallback, useEffect, useRef, useState } from 'react';
import { tasksApi } from '../api/client.js';

const byDueDate = (a, b) => new Date(a.dueAt) - new Date(b.dueAt);
const sortTasks = (tasks) => [...tasks].sort(byDueDate);

export function useTasks() {
  const [tasks, setTasks] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const tasksRef = useRef(tasks);

  useEffect(() => {
    tasksRef.current = tasks;
  }, [tasks]);

  const load = useCallback(async () => {
    setStatus('loading');
    setError('');
    try {
      const data = await tasksApi.list();
      setTasks(sortTasks(data));
      setStatus('ready');
    } catch (err) {
      setError(err.message);
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const createTask = useCallback(async (payload) => {
    const task = await tasksApi.create(payload);
    setTasks((prev) => sortTasks([...prev, task]));
    return task;
  }, []);

  const updateTask = useCallback(async (id, patch) => {
    const snapshot = tasksRef.current;
    setTasks((prev) =>
      sortTasks(
        prev.map((task) =>
          task.id === id
            ? { ...task, ...patch, updatedAt: new Date().toISOString() }
            : task
        )
      )
    );

    try {
      const updated = await tasksApi.update(id, patch);
      setTasks((prev) =>
        sortTasks(prev.map((task) => (task.id === id ? updated : task)))
      );
      return updated;
    } catch (err) {
      setTasks(snapshot);
      throw err;
    }
  }, []);

  const deleteTask = useCallback(async (id) => {
    const snapshot = tasksRef.current;
    setTasks((prev) => prev.filter((task) => task.id !== id));

    try {
      return await tasksApi.remove(id);
    } catch (err) {
      setTasks(snapshot);
      throw err;
    }
  }, []);

  return {
    tasks,
    status,
    error,
    refresh: load,
    createTask,
    updateTask,
    deleteTask,
  };
}
