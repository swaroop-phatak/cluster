import { apiClient } from "../../lib/api-client";
import type { User } from "../../store/useAuthStore";

export async function getCurrentUser(): Promise<User> {
  const response = await apiClient.get<{ user: User }>("/auth/me");
  return response.data.user;
}

export async function login(email: string, password: string) {
  const { data } = await apiClient.post("/auth/login", {
    email,
    password,
  });

  return data.user;
}

export async function register(
  email: string,
  password: string,
  name: string,
) {
  const { data } = await apiClient.post("/auth/register", {
    email,
    password,
    name,
  });

  return data.user;
}

export async function logout() {
  await apiClient.post("/auth/logout");
}