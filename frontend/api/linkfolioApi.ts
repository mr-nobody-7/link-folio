const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

type FetchOptions = RequestInit;

async function apiFetch(path: string, options: FetchOptions = {}) {
  const token =
    typeof window !== 'undefined' ? localStorage.getItem('lf_token') : null;

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(BASE_URL + path, {
    ...options,
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

  if (typeof window !== 'undefined' && data?.token) {
    localStorage.setItem('lf_token', data.token);
  }

  return data.user;
}

export async function login(body: { email: string; password: string }) {
  const data = await apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify(body),
  });

  if (typeof window !== 'undefined' && data?.token) {
    localStorage.setItem('lf_token', data.token);
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

export async function recordLinkClick(linkId: string, username: string) {
  return apiFetch('/analytics/link-click', {
    method: 'POST',
    body: JSON.stringify({ linkId, username }),
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

export function clearToken() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('lf_token');
  }
}
