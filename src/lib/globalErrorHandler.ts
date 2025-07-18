import { captureErrorRenderer, captureMessageRenderer } from "./sentry-renderer";

// Global error handler for unhandled errors
export function setupGlobalErrorHandlers() {
  // Handle unhandled promise rejections
  window.addEventListener("unhandledrejection", (event) => {
    console.error("Unhandled promise rejection:", event.reason);

    // Capture the error in Sentry
    if (event.reason instanceof Error) {
      captureErrorRenderer(event.reason, {
        type: "unhandledrejection",
        promise: event.promise,
      });
    } else {
      captureMessageRenderer(`Unhandled promise rejection: ${event.reason}`, "error");
    }

    // Prevent the default browser behavior
    event.preventDefault();
  });

  // Handle unhandled errors
  window.addEventListener("error", (event) => {
    console.error("Unhandled error:", event.error);

    // Capture the error in Sentry
    if (event.error instanceof Error) {
      captureErrorRenderer(event.error, {
        type: "unhandlederror",
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });
    } else {
      captureMessageRenderer(`Unhandled error: ${event.message}`, "error");
    }
  });

  // Handle resource loading errors
  window.addEventListener(
    "error",
    (event) => {
      if (event.target !== window) {
        console.error("Resource loading error:", event);

        captureMessageRenderer(`Resource loading error: ${event.target}`, "warning");
      }
    },
    true
  );

  // Handle console errors (optional - for development)
  // Note: In renderer process, we'll always capture console errors for debugging
  const originalConsoleError = console.error;
  console.error = (...args) => {
    originalConsoleError.apply(console, args);

    // Capture console errors
    const errorMessage = args.map((arg) => (typeof arg === "string" ? arg : JSON.stringify(arg))).join(" ");

    captureMessageRenderer(`Console error: ${errorMessage}`, "error");
  };
}

// Setup error handlers for the main process
export function setupMainProcessErrorHandlers() {
  // Handle uncaught exceptions
  process.on("uncaughtException", (error) => {
    console.error("Uncaught exception:", error);

    // Note: This would need to be called from the main process
    // captureErrorMain(error, { type: 'uncaughtException' });
  });

  // Handle unhandled promise rejections
  process.on("unhandledRejection", (reason, promise) => {
    console.error("Unhandled promise rejection:", reason);

    // Note: This would need to be called from the main process
    // if (reason instanceof Error) {
    //   captureErrorMain(reason, { type: 'unhandledRejection', promise });
    // } else {
    //   captureMessageMain(`Unhandled promise rejection: ${reason}`, 'error');
    // }
  });
}
