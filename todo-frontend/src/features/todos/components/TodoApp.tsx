"use client";

import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import type { Todo } from "@/features/todos/lib/types";
import { useTodos } from "@/features/todos/hooks/useTodos";
import { TodoForm } from "./TodoForm";
import { TodoList } from "./TodoList";

export function TodoApp() {
  const {
    todos,
    isLoading,
    isSaving,
    error,
    counts,
    loadTodos,
    addTodo,
    editTodo,
    removeTodo,
  } = useTodos();

  const handleToggle = async (todo: Todo) => {
    await editTodo(todo.id, {
      title: todo.title,
      completed: !todo.completed,
    });
  };

  const handleEdit = async (todo: Todo, nextTitle: string) => {
    await editTodo(todo.id, {
      title: nextTitle,
      completed: todo.completed,
    });
  };

  return (
    <Container maxWidth="md" sx={{ py: { xs: 5, md: 8 } }}>
      <Stack spacing={3}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2.5, md: 3 },
            borderRadius: 4,
            border: "1px solid var(--line)",
            background:
              "linear-gradient(120deg,#f8fafc 0%,#fff7ed 40%,#eef2ff 100%)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              right: -40,
              top: -40,
              width: 120,
              height: 120,
              borderRadius: "50%",
              bgcolor: "rgba(234, 88, 12, 0.15)",
              filter: "blur(12px)",
            }}
          />
          <Box
            sx={{
              position: "absolute",
              left: -32,
              bottom: -40,
              width: 100,
              height: 100,
              borderRadius: "50%",
              bgcolor: "rgba(20, 184, 166, 0.2)",
              filter: "blur(12px)",
            }}
          />

          <Typography variant="h3" sx={{ fontWeight: 700, letterSpacing: "-0.02em" }}>
            Todo Flow
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1, maxWidth: 680 }}>
            Organize your tasks with a simple CRUD workflow built for production.
          </Typography>

          <Stack direction="row" spacing={1} sx={{ mt: 2.5, flexWrap: "wrap", gap: 1 }}>
            <Chip label={`Total: ${counts.total}`} />
            <Chip label={`Pending: ${counts.pending}`} />
            <Chip label={`Done: ${counts.completed}`} />
          </Stack>
        </Paper>

        <TodoForm isSaving={isSaving} onSubmit={addTodo} />

        {error && (
          <Alert
            severity="error"
            action={
              <Button
                color="inherit"
                size="small"
                onClick={() => {
                  loadTodos().catch(() => undefined);
                }}
              >
                Retry
              </Button>
            }
          >
            {error}
          </Alert>
        )}

        {isLoading ? (
          <Paper
            variant="outlined"
            sx={{
              px: 3,
              py: 5,
              textAlign: "center",
              borderRadius: 3,
              borderColor: "var(--line)",
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Loading todos...
            </Typography>
          </Paper>
        ) : (
          <TodoList
            todos={todos}
            isSaving={isSaving}
            onToggle={handleToggle}
            onEdit={handleEdit}
            onDelete={removeTodo}
          />
        )}
      </Stack>
    </Container>
  );
}
