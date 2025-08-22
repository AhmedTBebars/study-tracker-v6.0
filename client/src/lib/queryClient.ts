import { QueryClient, QueryFunction } from '@tanstack/react-query';
import { API_BASE } from '../config';

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const errorBody = await res.json().catch(() => res.text());
    throw new Error(`${res.status}: ${JSON.stringify(errorBody) || res.statusText}`);
  }
}

export async function apiRequest(
  method: string,
  url: string, // e.g., "/api/tasks"
  data?: unknown | undefined
): Promise<Response> {
  const fullUrl = new URL(url, API_BASE);
  // Add a cache-busting parameter for non-GET requests as well, just in case
  fullUrl.searchParams.append('t', new Date().getTime().toString());

  const config: RequestInit = {
    method,
    credentials: 'include',
  };

  if (data instanceof FormData) {
    config.body = data;
  } else if (data) {
    config.headers = { 'Content-Type': 'application/json' };
    config.body = JSON.stringify(data);
  }

  const res = await fetch(fullUrl.href, config);

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = 'returnNull' | 'throw';
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const path = queryKey.join('/');
    const fullUrl = new URL(path, API_BASE);
    
    // --- FIX: Add a cache-busting query parameter to every GET request ---
    fullUrl.searchParams.append('t', new Date().getTime().toString());

    const res = await fetch(fullUrl.href, {
      credentials: 'include',
    });

    if (unauthorizedBehavior === 'returnNull' && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: 'throw' }),
      refetchInterval: false,
      refetchOnWindowFocus: true,
      staleTime: 0, 
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
