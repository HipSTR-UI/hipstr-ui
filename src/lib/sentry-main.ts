import {
  init,
  captureException,
  captureMessage,
  setUser,
  setTag,
  setExtra,
  flush,
  SeverityLevel,
} from "@sentry/electron/main";
import { SENTRY_DSN } from "src/constants/global";
import { app } from "electron";

// Initialize Sentry for main process
export function initSentryMain() {
  init({
    dsn: SENTRY_DSN,
    // Enable performance monitoring
    tracesSampleRate: 0.1,
    // Set environment
    environment: !MAIN_WINDOW_VITE_DEV_SERVER_URL ? "development" : "production",
    // Add release information
    release: app.getVersion(),
    // Configure beforeSend to filter out certain errors
    beforeSend(event: any) {
      // Filter out certain types of errors if needed
      if (event.exception) {
        const exception = event.exception.values?.[0];
        if (exception?.type === "NetworkError" && exception?.value?.includes("net::ERR_INTERNET_DISCONNECTED")) {
          return null; // Don't send network disconnection errors
        }
      }
      return event;
    },
    // Set debug mode in development
    debug: false,
  });
}

// Capture and report errors in main process
export function captureErrorMain(error: Error, context?: Record<string, any>) {
  if (context) {
    setExtra("additional_context", context);
  }
  captureException(error);
}

// Capture and report messages in main process
export function captureMessageMain(message: string, level: SeverityLevel = "info") {
  captureMessage(message, level);
}

// Set user context in main process
export function setUserContextMain(user: { id?: string; email?: string; username?: string }) {
  setUser(user);
}

// Set tags for better filtering in main process
export function setTagContextMain(key: string, value: string) {
  setTag(key, value);
}

// Set extra context in main process
export function setExtraContextMain(key: string, value: any) {
  setExtra(key, value);
}

// Flush events before app closes
export async function flushSentryMain() {
  await flush(2000); // Wait up to 2 seconds for events to be sent
}
