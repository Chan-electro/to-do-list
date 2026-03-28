"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth-store";

interface MeResponse {
  user: { userId: string; name: string } | null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, clearUser, setLoaded } = useAuthStore();

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json() as Promise<MeResponse>)
      .then(({ user }) => {
        if (user) {
          setUser(user.userId, user.name);
        } else {
          clearUser();
        }
      })
      .catch(() => clearUser())
      .finally(() => setLoaded());
  }, [setUser, clearUser, setLoaded]);

  return <>{children}</>;
}
