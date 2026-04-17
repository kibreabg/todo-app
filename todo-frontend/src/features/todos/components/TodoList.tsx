"use client";

import { Paper, Stack, Typography } from "@mui/material";
import type { Todo } from "@/features/todos/lib/types";
import { TodoItem } from "./TodoItem";

type TodoListProps = {
  todos: Todo[];
  isSaving: boolean;
  onToggle: (todo: Todo) => Promise<void>;
  onEdit: (todo: Todo, nextTitle: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
};

export function TodoList({
  todos,
  isSaving,
  onToggle,
  onEdit,
  onDelete,
}: Readonly<TodoListProps>) {
  if (!todos.length) {
    return (
      <Paper
        variant="outlined"
        sx={{
          px: 3,
          py: 5,
          textAlign: "center",
          borderRadius: 3,
          borderStyle: "dashed",
          borderColor: "var(--line)",
        }}
      >
        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
          No todos yet.
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
          Add your first task above to get started.
        </Typography>
      </Paper>
    );
  }

  return (
    <Stack spacing={1.5}>
      {todos.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          isSaving={isSaving}
          onToggle={onToggle}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </Stack>
  );
}
