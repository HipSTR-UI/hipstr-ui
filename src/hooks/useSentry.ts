import { useCallback } from "react";
import {
  captureErrorRenderer,
  captureMessageRenderer,
  setUserContextRenderer,
  setTagContextRenderer,
  setExtraContextRenderer,
} from "../lib/sentry-renderer";

export function useSentry() {
  const captureError = useCallback((error: Error, context?: Record<string, any>) => {
    captureErrorRenderer(error, context);
  }, []);

  const captureMessage = useCallback(
    (message: string, level: "fatal" | "error" | "warning" | "info" | "debug" = "info") => {
      captureMessageRenderer(message, level);
    },
    []
  );

  const setUser = useCallback((user: { id?: string; email?: string; username?: string }) => {
    setUserContextRenderer(user);
  }, []);

  const setTag = useCallback((key: string, value: string) => {
    setTagContextRenderer(key, value);
  }, []);

  const setExtra = useCallback((key: string, value: any) => {
    setExtraContextRenderer(key, value);
  }, []);

  return {
    captureError,
    captureMessage,
    setUser,
    setTag,
    setExtra,
  };
}
