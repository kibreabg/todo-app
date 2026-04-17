"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getCurrentUser,
  login as loginRequest,
  logout as logoutRequest,
  register as registerRequest,
} from "@/features/auth/lib/api";
import type {
  AuthUser,
  LoginPayload,
  RegisterPayload,
} from "@/features/auth/lib/types";

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const bootstrap = useCallback(async () => {
    setIsLoading(true);

    try {
      const me = await getCurrentUser();
      setUser(me);
      setError(null);
    } catch (bootstrapError) {
      const message =
        bootstrapError instanceof Error
          ? bootstrapError.message
          : "Failed to initialize auth session.";
      setError(message);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  const login = useCallback(async (payload: LoginPayload) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const authenticated = await loginRequest(payload);
      setUser(authenticated);
      return authenticated;
    } catch (authError) {
      const message =
        authError instanceof Error ? authError.message : "Login failed.";
      setError(message);
      throw authError;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const authenticated = await registerRequest(payload);
      setUser(authenticated);
      return authenticated;
    } catch (authError) {
      const message =
        authError instanceof Error ? authError.message : "Registration failed.";
      setError(message);
      throw authError;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      await logoutRequest();
      setUser(null);
    } catch (authError) {
      const message =
        authError instanceof Error ? authError.message : "Logout failed.";
      setError(message);
      throw authError;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  return {
    user,
    isLoading,
    isSubmitting,
    error,
    bootstrap,
    login,
    register,
    logout,
  };
}
