import React, { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';

import Router from './routes';
import { useAuthStore } from './stores/useAuth';

const App: React.FC = () => {
  const queryClient = new QueryClient();
  const { Authorization } = useAuthStore();
  useEffect(() => {
    Authorization();
  })

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className='app'>
          <Router />
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;