import { useQuery } from "@tanstack/react-query";
import type { Task } from "@shared/schema";

export function useTasks() {
  const { data: tasks, isLoading, error } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  return {
    tasks,
    isLoading,
    error,
  };
}
