const AUTH_TOKEN_KEY = "dishbuilder_auth_token";

function getToken() {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

function setToken(token) {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
}

function clearToken() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
}

async function request(path, options = {}) {
  const token = getToken();
  const response = await fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || "Request failed");
  }
  return payload;
}

export async function getSessionUser() {
  const token = getToken();
  if (!token) return null;

  try {
    const payload = await request("/api/auth.php?action=me", { method: "GET" });
    return payload.user || null;
  } catch {
    clearToken();
    return null;
  }
}

export async function signUp(formData) {
  const payload = await request("/api/auth.php?action=signup", {
    method: "POST",
    body: JSON.stringify({
      name: formData.name,
      email: formData.email,
      password: formData.password,
    }),
  });

  if (payload.token) setToken(payload.token);
  return payload.user;
}

export async function signIn(formData) {
  const payload = await request("/api/auth.php?action=login", {
    method: "POST",
    body: JSON.stringify({
      email: formData.email,
      password: formData.password,
    }),
  });

  if (payload.token) setToken(payload.token);
  return payload.user;
}

export async function signOut() {
  try {
    await request("/api/auth.php?action=logout", { method: "POST", body: "{}" });
  } finally {
    clearToken();
  }
}

export function getAuthToken() {
  return getToken();
}
