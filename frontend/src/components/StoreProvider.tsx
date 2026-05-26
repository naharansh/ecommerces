"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { authAPI } from "@/lib/api";

export default function StoreProvider({ children }: { children: React.ReactNode }) {
  const hydrate = useAuthStore((s) => s.hydrate);
  const setUser = useAuthStore((s) => s.setUser);
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (isAuthenticated && !user) {
      authAPI.getMe().then(({ data }) => {
        if (data?.user) {
          setUser(data.user);
          localStorage.setItem("user", JSON.stringify(data.user));
        }
      }).catch(() => {
        useAuthStore.getState().logout();
      });
    }
  }, [isAuthenticated, user, setUser]);

  return <>{children}</>;
}
