import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WsProvider } from './ws/WsProvider';
import App from './App';
import './styles/variables.css';
import './styles/responsive.css';
import './styles/global.css';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: 1,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <WsProvider>
        <App />
      </WsProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
