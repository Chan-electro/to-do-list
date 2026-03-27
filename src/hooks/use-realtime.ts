"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

export function useRealtime() {
  const queryClient = useQueryClient();

  useEffect(() => {
    let cleanup: (() => void) | undefined;

    import("@/lib/socket")
      .then(({ getSocket }) => {
        try {
          const socket = getSocket();

          const handleTaskUpdate = () =>
            queryClient.invalidateQueries({ queryKey: ["task"] });
          const handleHabitUpdate = () =>
            queryClient.invalidateQueries({ queryKey: ["habit"] });
          const handleTimerUpdate = () =>
            queryClient.invalidateQueries({ queryKey: ["timer"] });

          socket.on("task:updated", handleTaskUpdate);
          socket.on("habit:updated", handleHabitUpdate);
          socket.on("timer:updated", handleTimerUpdate);

          cleanup = () => {
            socket.off("task:updated", handleTaskUpdate);
            socket.off("habit:updated", handleHabitUpdate);
            socket.off("timer:updated", handleTimerUpdate);
          };
        } catch {
          // Socket not available, that's fine
        }
      })
      .catch(() => {});

    return () => {
      if (cleanup) cleanup();
    };
  }, [queryClient]);
}
