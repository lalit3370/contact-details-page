import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LayoutOverrideProvider } from '@/features/contact-details/layout/LayoutOverrideContext.jsx';
import { ErrorBoundary } from '@/shared/ErrorBoundary.jsx';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60_000,
      gcTime: 30 * 60_000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

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
