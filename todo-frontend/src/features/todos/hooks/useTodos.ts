"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  createTodo as createTodoRequest,
  deleteTodo as deleteTodoRequest,
  listTodos,
  updateTodo as updateTodoRequest,
} from "@/features/todos/lib/api";
import type { Todo } from "@/features/todos/lib/types";

type UseTodosOptions = {
  enabled?: boolean;
};

function sortTodos(todos: Todo[]): Todo[] {
  return [...todos].sort(
    (a, b) =>
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
}

export function useTodos(options: UseTodosOptions = {}) {
  const { enabled = true } = options;
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTodos = useCallback(async (showLoading = true) => {
    if (!enabled) {
      setTodos([]);
      setError(null);
      setIsLoading(false);
      return;
    }

    if (showLoading) {
      setIsLoading(true);
    }

    try {
      const items = await listTodos();
      setTodos(sortTodos(items));
      setError(null);
    } catch (loadError) {
      const message =
        loadError instanceof Error ? loadError.message : "Failed to load todos.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    // Initial data hydration on mount.
    const timeoutId = setTimeout(() => {
      void loadTodos(false);
    }, 0);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [enabled, loadTodos]);

  const addTodo = useCallback(async (title: string) => {
    if (!enabled) {
      throw new Error("Authentication required.");
    }

    setIsSaving(true);
    setError(null);

    try {
      const created = await createTodoRequest({
        title,
        completed: false,
      });

      setTodos((prev) => sortTodos([created, ...prev]));
    } catch (createError) {
      const message =
        createError instanceof Error ? createError.message : "Failed to add todo.";
      setError(message);
      throw createError;
    } finally {
      setIsSaving(false);
    }
  }, [enabled]);

  const editTodo = useCallback(
    async (id: string, updates: Pick<Todo, "title" | "completed">) => {
      if (!enabled) {
        throw new Error("Authentication required.");
      }

      setIsSaving(true);
      setError(null);

      try {
        const updated = await updateTodoRequest(id, {
          title: updates.title,
          completed: updates.completed,
        });

        setTodos((prev) =>
          sortTodos(prev.map((item) => (item.id === id ? updated : item))),
        );
      } catch (updateError) {
        const message =
          updateError instanceof Error
            ? updateError.message
            : "Failed to update todo.";
        setError(message);
        throw updateError;
      } finally {
        setIsSaving(false);
      }
    },
    [enabled],
  );

  const removeTodo = useCallback(async (id: string) => {
    if (!enabled) {
      throw new Error("Authentication required.");
    }

    setIsSaving(true);
    setError(null);

    try {
      await deleteTodoRequest(id);
      setTodos((prev) => prev.filter((item) => item.id !== id));
    } catch (deleteError) {
      const message =
        deleteError instanceof Error
          ? deleteError.message
          : "Failed to delete todo.";
      setError(message);
      throw deleteError;
    } finally {
      setIsSaving(false);
    }
  }, [enabled]);

  const counts = useMemo(() => {
    const completed = todos.filter((item) => item.completed).length;

    return {
      total: todos.length,
      completed,
      pending: todos.length - completed,
    };
  }, [todos]);

  return {
    todos,
    isLoading,
    isSaving,
    error,
    counts,
    loadTodos,
    addTodo,
    editTodo,
    removeTodo,
  };
}
