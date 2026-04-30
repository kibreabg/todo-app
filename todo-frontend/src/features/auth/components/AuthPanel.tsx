"use client";

import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Paper,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import type {
  LoginPayload,
  RegisterPayload,
} from "@/features/auth/lib/types";

type AuthPanelProps = {
  isSubmitting: boolean;
  error: string | null;
  onLogin: (payload: LoginPayload) => Promise<unknown>;
  onRegister: (payload: RegisterPayload) => Promise<unknown>;
};

export function AuthPanel({
  isSubmitting,
  error,
  onLogin,
  onRegister,
}: Readonly<AuthPanelProps>) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userName, setUserName] = useState("");

  const canSubmit = email.trim().length > 0 && password.trim().length > 0;

  const handleSubmit = async () => {
    if (!canSubmit || isSubmitting) {
      return;
    }

    if (mode === "login") {
      await onLogin({
        email: email.trim(),
        password,
      });

      return;
    }

    await onRegister({
      email: email.trim(),
      password,
      userName: userName.trim() || undefined,
    });
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2.5, md: 3 },
        borderRadius: 4,
        border: "1px solid var(--line)",
      }}
    >
      <Stack spacing={2}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          {mode === "login" ? "Sign in" : "Create account"}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Sign in to access your private todo list.
        </Typography>

        {error && <Alert severity="error">{error}</Alert>}

        <TextField
          label="Email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          fullWidth
          autoComplete="email"
        />

        {mode === "register" && (
          <TextField
            label="User name (optional)"
            value={userName}
            onChange={(event) => setUserName(event.target.value)}
            fullWidth
            autoComplete="username"
          />
        )}

        <TextField
          label="Password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          fullWidth
          autoComplete={mode === "login" ? "current-password" : "new-password"}
        />

        <Button
          variant="contained"
          size="large"
          onClick={() => {
            void handleSubmit().catch(() => undefined);
          }}
          disabled={!canSubmit || isSubmitting}
        >
          {mode === "login" ? "Sign in" : "Create account"}
        </Button>

        <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1 }}>
          <Button
            variant="text"
            onClick={() => setMode("login")}
            disabled={mode === "login" || isSubmitting}
          >
            I have an account
          </Button>
          <Button
            variant="text"
            onClick={() => setMode("register")}
            disabled={mode === "register" || isSubmitting}
          >
            I need to register
          </Button>
        </Box>
      </Stack>

      <Snackbar
        open={Boolean(error)}
        autoHideDuration={6000}
        onClose={(_, reason) => {
          if (reason === "clickaway") {
            return;
          }
        }}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          severity="error"
          variant="filled"
          sx={{ width: "100%" }}
        >
          {error}
        </Alert>
      </Snackbar>
    </Paper>
  );
}
