const API_BASE_URL = '/api';

export class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    message?: string
  ) {
    super(message || `API error: ${status} ${statusText}`);
    this.name = 'ApiError';
  }
}

export async function apiClient<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
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
