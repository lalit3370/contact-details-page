import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './queryClient.js';
import { LayoutOverrideProvider } from '@/features/contact-details/layout/LayoutOverrideContext.jsx';
import { ErrorBoundary } from '@/shared/ErrorBoundary.jsx';

export function AppProviders({ children }) {
  return (
    <ErrorBoundary fallback={<RootErrorFallback />}>
      <QueryClientProvider client={queryClient}>
        <LayoutOverrideProvider>{children}</LayoutOverrideProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

function RootErrorFallback() {
  return (
    <div role="alert" style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>Something went wrong</h1>
      <p>Please reload the page.</p>
    </div>
  );
}
