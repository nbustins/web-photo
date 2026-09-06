import { getToken } from './auth/auth.store';

const baseUrl = import.meta.env.VITE_API_BASE_URL;

/** RFC 9457 body produced by wedding-manager-api (errorCode is our extension, spec 011). */
export type ProblemDetails = {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  errorCode?: string;
  traceId?: string;
  errors?: Record<string, string[]>;
};

export class ApiError extends Error {
  constructor(public status: number, message: string, public code?: string) {
    super(message);
    this.name = 'ApiError';
  }
}

function toApiError(status: number, data: unknown, statusText: string): ApiError {
  const problem = (data && typeof data === 'object' ? data : {}) as ProblemDetails & { message?: string };
  const message = problem.detail || problem.title || problem.message || statusText;
  return new ApiError(status, message, problem.errorCode);
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  if (!baseUrl) {
    throw new ApiError(0, 'VITE_API_BASE_URL no està configurat');
  }

  const headers = new Headers(init.headers);
  // FormData: the browser sets multipart/form-data with its boundary itself.
  if (!headers.has('Content-Type') && init.body && !(init.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  const token = getToken();
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${baseUrl}${path}`, { ...init, headers });

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  const data = text ? safeJson(text) : null;

  if (!response.ok) {
    throw toApiError(response.status, data, response.statusText);
  }

  return data as T;
}

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export function apiGet<T>(path: string): Promise<T> {
  return request<T>(path, { method: 'GET' });
}

/** Binary GET (PDF downloads): same auth handling as request(), but no JSON parsing. */
export async function apiGetBlob(path: string): Promise<Blob> {
  if (!baseUrl) {
    throw new ApiError(0, 'VITE_API_BASE_URL no està configurat');
  }

  const headers = new Headers();
  const token = getToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const response = await fetch(`${baseUrl}${path}`, { headers });
  if (!response.ok) {
    const text = await response.text();
    throw toApiError(response.status, text ? safeJson(text) : null, response.statusText);
  }

  return response.blob();
}

export function apiPost<T, B = unknown>(path: string, body?: B): Promise<T> {
  return request<T>(path, {
    method: 'POST',
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

export function apiPostForm<T>(path: string, form: FormData): Promise<T> {
  return request<T>(path, { method: 'POST', body: form });
}

export function apiPut<T, B = unknown>(path: string, body?: B): Promise<T> {
  return request<T>(path, {
    method: 'PUT',
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

export function apiPatch<T, B = unknown>(path: string, body?: B): Promise<T> {
  return request<T>(path, {
    method: 'PATCH',
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

export function apiDelete<T = void>(path: string): Promise<T> {
  return request<T>(path, { method: 'DELETE' });
}
