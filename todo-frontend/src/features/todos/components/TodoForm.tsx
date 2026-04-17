"use client";

import { useState } from "react";
import { Box, Button, Paper, Stack, TextField } from "@mui/material";

type TodoFormProps = {
  isSaving: boolean;
  onSubmit: (title: string) => Promise<void>;
};

type FormSubmitEvent = Parameters<
  NonNullable<React.ComponentProps<"form">["onSubmit"]>
>[0];

export function TodoForm({ isSaving, onSubmit }: Readonly<TodoFormProps>) {
  const [title, setTitle] = useState("");

  const handleSubmit = async (event: FormSubmitEvent) => {
    event.preventDefault();

    const trimmed = title.trim();
    if (!trimmed) {
      return;
    }

    await onSubmit(trimmed);
    setTitle("");
  };

  return (
    <Paper
      component="form"
      onSubmit={(event) => {
        void handleSubmit(event);
      }}
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 3,
        border: "1px solid var(--line)",
      }}
    >
      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
        <TextField
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Add a new task"
          fullWidth
          size="small"
          disabled={isSaving}
          slotProps={{
            htmlInput: {
              maxLength: 150,
            },
          }}
        />
        <Box>
          <Button
            type="submit"
            variant="contained"
            disabled={isSaving || !title.trim()}
            sx={{
              minWidth: 110,
              height: 40,
              bgcolor: "var(--accent)",
              "&:hover": {
                bgcolor: "var(--accent-strong)",
              },
            }}
          >
            Add
          </Button>
        </Box>
      </Stack>
    </Paper>
  );
}
