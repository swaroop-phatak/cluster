import { useEffect } from "react";
import { getCurrentUser } from "./api";
import { useAuthStore } from "../../store/useAuthStore";

export function AuthInitializer() {
  const setUser = useAuthStore((state) => state.setUser);
  const clearUser = useAuthStore((state) => state.clearUser);

  useEffect(() => {
    getCurrentUser()
      .then((user) => {
        setUser(user);
      })
      .catch(() => {
        clearUser();
      });
  }, [setUser, clearUser]);

  return null;
}