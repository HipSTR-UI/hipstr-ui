import {
  init,
  captureException,
  captureMessage,
  setUser,
  setTag,
  setExtra,
  SeverityLevel,
} from "@sentry/electron/renderer";
import { SENTRY_DSN } from "src/constants/global";

// Initialize Sentry for renderer process
export async function initSentryRenderer() {
  const appInfo = await electron.appInfo();
  init({
    dsn: SENTRY_DSN,
    // Enable performance monitoring
    tracesSampleRate: 0.1,
    // Set environment
    environment: appInfo.env,
    // Add release information
    release: appInfo.version,
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

// Capture and report errors in renderer process
export function captureErrorRenderer(error: Error, context?: Record<string, any>) {
  if (context) {
    setExtra("additional_context", context);
  }
  captureException(error);
}

// Capture and report messages in renderer process
export function captureMessageRenderer(message: string, level: SeverityLevel = "info") {
  captureMessage(message, level);
}

// Set user context in renderer process
export function setUserContextRenderer(user: { id?: string; email?: string; username?: string }) {
  setUser(user);
}

// Set tags for better filtering in renderer process
export function setTagContextRenderer(key: string, value: string) {
  setTag(key, value);
}

// Set extra context in renderer process
export function setExtraContextRenderer(key: string, value: any) {
  setExtra(key, value);
}

// Flush events before app closes
export async function flushSentryRenderer() {
  // Note: flush is not available in renderer process
  // Events will be sent automatically
}
