const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

type FetchOptions = RequestInit;

function decodeBase64Url(value: string): string {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4);

  if (typeof window !== 'undefined' && typeof window.atob === 'function') {
    return window.atob(padded);
  }

  return Buffer.from(padded, 'base64').toString('utf-8');
}

export function isTokenExpired(token: string): boolean {
  try {
    const parts = token.split('.');
    if (parts.length < 2) {
      return true;
    }

    const payload = JSON.parse(decodeBase64Url(parts[1]));
    if (!payload?.exp) {
      return true;
    }

    return payload.exp * 1000 < Date.now() + 60_000;
  } catch {
    return true;
  }
}

async function refreshAccessToken(): Promise<string | null> {
  const response = await fetch(`${BASE_URL}/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    return null;
  }

  const data = await response.json();
  if (data?.token && typeof window !== 'undefined') {
    localStorage.setItem('lf_token', data.token);
    return data.token as string;
  }

  return null;
}

async function apiFetch(path: string, options: FetchOptions = {}) {
  let token =
    typeof window !== 'undefined' ? localStorage.getItem('lf_token') : null;

  if (token && isTokenExpired(token)) {
    const refreshedToken = await refreshAccessToken();

    if (!refreshedToken) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('lf_token');
        localStorage.removeItem('lf_user');
        if (!window.location.pathname.startsWith('/auth/login')) {
          window.location.href = '/auth/login';
        }
      }
      throw new Error('Session expired. Please log in again.');
    }

    token = refreshedToken;
  }

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(BASE_URL + path, {
    ...options,
    credentials: 'include',
    headers,
  });

  if (response.ok) {
    return response.json();
  }

  let data: any = {};
  try {
    data = await response.json();
  } catch {
    data = {};
  }

  throw new Error(data.message || data.error || 'Request failed');
}

export async function signup(body: {
  displayName: string;
  email: string;
  username: string;
  password: string;
}) {
  const data = await apiFetch('/auth/signup', {
    method: 'POST',
    body: JSON.stringify(body),
  });

  if (typeof window !== 'undefined') {
    if (data?.token) {
      localStorage.setItem('lf_token', data.token);
    }
    if (data?.user) {
      localStorage.setItem('lf_user', JSON.stringify(data.user));
    }
  }

  return data.user;
}

export async function login(body: { email: string; password: string }) {
  const data = await apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify(body),
  });

  if (typeof window !== 'undefined') {
    if (data?.token) {
      localStorage.setItem('lf_token', data.token);
    }
    if (data?.user) {
      localStorage.setItem('lf_user', JSON.stringify(data.user));
    }
  }

  return data.user;
}

export async function getProfile(username: string) {
  return apiFetch(`/profile/${encodeURIComponent(username)}`, {
    method: 'GET',
  });
}

export async function updateProfile(
  data: Partial<{
    displayName: string;
    bio: string;
    avatarUrl: string;
    theme: string;
    username: string;
  }>
) {
  return apiFetch('/profile', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function getLinks() {
  return apiFetch('/links', {
    method: 'GET',
  });
}

export async function createLink(data: {
  title: string;
  url: string;
  isTemporary?: boolean;
  expiresAt?: string;
}) {
  return apiFetch('/links', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateLinks(links: any[]) {
  return apiFetch('/links', {
    method: 'PUT',
    body: JSON.stringify({ links }),
  });
}

export async function deleteLink(linkId: string) {
  return apiFetch(`/links/${encodeURIComponent(linkId)}`, {
    method: 'DELETE',
  });
}

export async function recordLinkClick(
  linkId: string,
  username: string,
  referrer?: string
) {
  const effectiveReferrer =
    referrer || (typeof document !== 'undefined' ? document.referrer : '') || '';

  return apiFetch('/analytics/link-click', {
    method: 'POST',
    body: JSON.stringify({ linkId, username, referrer: effectiveReferrer }),
  });
}

export async function getAnalytics(days?: number) {
  const queryDays = days || 7;
  return apiFetch(`/analytics?days=${encodeURIComponent(String(queryDays))}`, {
    method: 'GET',
  });
}

export async function recordProfileView(username: string) {
  return apiFetch('/analytics/profile-view', {
    method: 'POST',
    body: JSON.stringify({ username }),
  });
}

export async function getMessages(username: string) {
  return apiFetch(`/messages/${encodeURIComponent(username)}`, {
    method: 'GET',
  });
}

export async function postMessage(username: string, content: string) {
  return apiFetch(`/messages/${encodeURIComponent(username)}`, {
    method: 'POST',
    body: JSON.stringify({ content }),
  });
}

export function getToken() {
  if (typeof window === 'undefined') {
    return null;
  }
  return localStorage.getItem('lf_token');
}

export async function clearToken() {
  try {
    await apiFetch('/auth/logout', {
      method: 'POST',
    });
  } catch {
    // Always clear local session, even if logout API fails.
  } finally {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('lf_token');
      localStorage.removeItem('lf_user');
    }
  }
}
