"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import type { Todo } from "@/features/todos/lib/types";

type TodoItemProps = {
  todo: Todo;
  isSaving: boolean;
  onToggle: (todo: Todo) => Promise<void>;
  onEdit: (todo: Todo, nextTitle: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
};

type FormSubmitEvent = Parameters<
  NonNullable<React.ComponentProps<"form">["onSubmit"]>
>[0];

export function TodoItem({
  todo,
  isSaving,
  onToggle,
  onEdit,
  onDelete,
}: Readonly<TodoItemProps>) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);
  const [updatedAtLabel, setUpdatedAtLabel] = useState("");

  useEffect(() => {
    setUpdatedAtLabel(new Date(todo.updatedAt).toLocaleString());
  }, [todo.updatedAt]);

  const handleSave = async (event: FormSubmitEvent) => {
    event.preventDefault();

    const trimmed = editTitle.trim();
    if (!trimmed) {
      return;
    }

    await onEdit(todo, trimmed);
    setIsEditing(false);
  };

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 3,
        borderColor: "var(--line)",
      }}
    >
      <CardContent>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: "flex-start" }}>
          <Checkbox
            slotProps={{
              input: {
                "aria-label": `Mark ${todo.title} as ${todo.completed ? "pending" : "completed"}`,
              },
            }}
            checked={todo.completed}
            disabled={isSaving}
            onChange={() => {
              void onToggle(todo);
            }}
            sx={{ mt: -0.5 }}
          />

          <Box sx={{ flex: 1, minWidth: 0 }}>
            {isEditing ? (
              <Box
                component="form"
                onSubmit={(event) => {
                  void handleSave(event);
                }}
              >
                <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                  <TextField
                    value={editTitle}
                    onChange={(event) => setEditTitle(event.target.value)}
                    disabled={isSaving}
                    size="small"
                    fullWidth
                    slotProps={{
                      htmlInput: {
                        maxLength: 150,
                      },
                    }}
                  />
                  <Stack direction="row" spacing={1}>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={isSaving || !editTitle.trim()}
                      size="small"
                    >
                      Save
                    </Button>
                    <Button
                      type="button"
                      variant="outlined"
                      disabled={isSaving}
                      size="small"
                      onClick={() => {
                        setEditTitle(todo.title);
                        setIsEditing(false);
                      }}
                    >
                      Cancel
                    </Button>
                  </Stack>
                </Stack>
              </Box>
            ) : (
              <>
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 600,
                    textDecoration: todo.completed ? "line-through" : "none",
                    opacity: todo.completed ? 0.6 : 1,
                    overflowWrap: "anywhere",
                  }}
                >
                  {todo.title}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Updated {updatedAtLabel || "..."}
                </Typography>
              </>
            )}
          </Box>

          {!isEditing && (
            <Stack direction="row" spacing={1}>
              <Button
                type="button"
                variant="outlined"
                size="small"
                onClick={() => setIsEditing(true)}
                disabled={isSaving}
              >
                Edit
              </Button>
              <Button
                type="button"
                variant="contained"
                size="small"
                color="error"
                onClick={() => {
                  void onDelete(todo.id);
                }}
                disabled={isSaving}
              >
                Delete
              </Button>
            </Stack>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
