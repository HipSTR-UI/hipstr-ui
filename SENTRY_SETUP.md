# Sentry Setup Guide

This project has been configured with Sentry for error tracking and monitoring. Follow these steps to complete the setup:

## 1. Create a Sentry Account

1. Go to [Sentry.io](https://sentry.io) and create an account
2. Create a new project for your Electron application
3. Choose "Electron" as the platform

## 2. Get Your DSN

1. In your Sentry project, go to Settings > Projects > [Your Project] > Client Keys (DSN)
2. Copy the DSN (it looks like: `https://xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx@xxxxx.ingest.sentry.io/xxxxx`)

## 3. Configure the DSN

Update the src/constants/global.ts file

## 4. Features Included

The Sentry integration includes:

### Error Tracking
- **React Error Boundary**: Catches React component errors
- **Global Error Handlers**: Catches unhandled errors and promise rejections
- **Main Process Errors**: Captures errors in the Electron main process
- **Renderer Process Errors**: Captures errors in the renderer process

### Performance Monitoring
- Transaction sampling (10% of transactions)
- Automatic session tracking

### Context and Metadata
- Environment detection (development/production)
- Release version tracking
- User context (when set)
- Custom tags and extra data

## 5. Usage Examples

### Capturing Errors in React Components

```typescript
import { useSentry } from '../hooks/useSentry';

function MyComponent() {
  const { captureError, setUser, setTag } = useSentry();

  const handleClick = async () => {
    try {
      // Your code here
    } catch (error) {
      captureError(error as Error, {
        component: 'MyComponent',
        action: 'handleClick'
      });
    }
  };

  // Set user context
  useEffect(() => {
    setUser({ id: 'user123', email: 'user@example.com' });
  }, []);

  // Set tags for filtering
  useEffect(() => {
    setTag('feature', 'my-feature');
  }, []);
}
```

### Capturing Errors in Main Process

```typescript
import { captureErrorMain } from './lib/sentry-main';

try {
  // Your main process code
} catch (error) {
  captureErrorMain(error as Error, {
    operation: 'file-operation',
    filePath: '/path/to/file'
  });
}
```

### Manual Error Reporting

```typescript
import { captureMessageRenderer } from './lib/sentry-renderer';

// Report a message
captureMessageRenderer('User performed action X', 'info');

// Report a warning
captureMessageRenderer('Something unexpected happened', 'warning');
```

## 6. Configuration Options

### Environment Variables

- `SENTRY_DSN`: Your Sentry DSN
- `NODE_ENV`: Set to 'production' for production builds

**Note**: Environment variables are automatically passed from the main process to the renderer process through the preload script. You don't need to configure them separately for each process.

### Sentry Configuration

The Sentry configuration can be customized in:
- `src/lib/sentry-main.ts` (main process)
- `src/lib/sentry-renderer.ts` (renderer process)

Key options:
- `tracesSampleRate`: Percentage of transactions to sample (default: 0.1)
- `environment`: Environment name (default: 'development')
- `release`: Release version (default: package.json version)
- `debug`: Enable debug mode (default: true in development)

## 7. Error Filtering

The configuration includes basic error filtering:

- Network disconnection errors are filtered out
- You can add more filters in the `beforeSend` function

## 8. Testing

To test that Sentry is working:

1. Set up your DSN
2. Run the application
3. Use the SentryTest component to trigger various types of errors and messages
4. Check your Sentry dashboard for the events

### Using the Test Component

Import and use the `SentryTest` component in your app:

```typescript
import { SentryTest } from './components/SentryTest';

// Add it to your app temporarily for testing
<SentryTest />
```

The test component provides buttons to:
- Test error capture
- Test message capture  
- Test user context setting
- Test tag setting
- Test error boundary (unhandled errors)

### Manual Testing

You can also manually trigger errors:

```typescript
// In any component
import { useSentry } from '../hooks/useSentry';

const { captureError } = useSentry();

// Trigger an error
try {
  throw new Error('Test error');
} catch (error) {
  captureError(error as Error);
}
```

## 9. Production Deployment

For production builds:

1. Set `NODE_ENV=production`
2. Ensure your DSN is configured
3. Build and package your application

## 10. Privacy and Data

Sentry collects:
- Error stack traces
- Performance data
- User context (when explicitly set)
- Environment information

No personal data is automatically collected. User context must be explicitly set using `setUser()`.

## 11. Troubleshooting

### Common Issues

1. **DSN not configured**: Check that your DSN is properly set
2. **No errors appearing**: Ensure you're not in development mode with debug disabled
3. **Network errors**: Check your internet connection and Sentry project settings

### Debug Mode

Enable debug mode by setting `debug: true` in the Sentry configuration to see detailed logs.

## 12. Support

For Sentry-specific issues, refer to:
- [Sentry Documentation](https://docs.sentry.io/)
- [Sentry Electron SDK](https://github.com/getsentry/sentry-electron) 