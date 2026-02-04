export const API_URL = "http://localhost:4000";

export function loginWithGoogle() {
  window.location.href = `${API_URL}/auth/google`;
}

export async function fetchMe() {
  const res = await fetch(`${API_URL}/me`, {
    credentials: "include",
  });

  if (!res.ok) return null;
  return res.json();
}

export async function logout() {
  await fetch(`${API_URL}/logout`, {
    method: "POST",
    credentials: "include",
  });
}

