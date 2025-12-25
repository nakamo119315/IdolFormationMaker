// Use /api which is proxied by Pages Functions in production
const API_BASE = '/api';

export class ApiError extends Error {
  status: number;
  statusText: string;

  constructor(status: number, statusText: string, message?: string) {
    super(message || `API error: ${status} ${statusText}`);
    this.name = 'ApiError';
    this.status = status;
    this.statusText = statusText;
  }
}

export async function apiClient<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    let errorMessage = '';
    try {
      const errorBody = await response.json();
      errorMessage = errorBody.message || errorBody.title || JSON.stringify(errorBody);
    } catch {
      errorMessage = response.statusText;
    }
    throw new ApiError(response.status, response.statusText, errorMessage);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}
