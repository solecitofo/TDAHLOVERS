import { Grid3X3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTasks } from "@/hooks/use-tasks";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

const moodEmojis: { [key: string]: string } = {
  "urgent-important": "😰",
  "urgent-not-important": "😐",
  "not-urgent-important": "😊",
  "not-urgent-not-important": "😑",
};

const priorityConfig = {
  "urgent-important": {
    title: "Urgente + Importante",
    bgColor: "bg-error-light",
    borderColor: "border-destructive",
    textColor: "text-destructive",
    borderClass: "border-l-4 border-destructive",
  },
  "not-urgent-important": {
    title: "No Urgente + Importante",
    bgColor: "bg-success-light",
    borderColor: "border-secondary",
    textColor: "text-secondary",
    borderClass: "border-l-4 border-secondary",
  },
  "urgent-not-important": {
    title: "Urgente + No Importante",
    bgColor: "bg-warning-light",
    borderColor: "border-accent",
    textColor: "text-accent",
    borderClass: "border-l-4 border-accent",
  },
  "not-urgent-not-important": {
    title: "No Urgente + No Importante",
    bgColor: "bg-gray-100",
    borderColor: "border-gray-300",
    textColor: "text-gray-600",
    borderClass: "border-l-4 border-gray-300",
  },
};

export default function EisenhowerMatrix() {
  const { tasks } = useTasks();
  const queryClient = useQueryClient();

  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, ...updates }: { id: number } & any) => {
      const response = await apiRequest("PATCH", `/api/tasks/${id}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
    },
  });

  const groupedTasks = tasks?.reduce((acc, task) => {
    const priority = task.priority || "not-urgent-not-important";
    if (!acc[priority]) acc[priority] = [];
    acc[priority].push(task);
    return acc;
  }, {} as Record<string, any[]>) || {};

  const handleTaskClick = (taskId: number, currentStatus: string) => {
    const newStatus = currentStatus === "completed" ? "pending" : "completed";
    updateTaskMutation.mutate({ id: taskId, status: newStatus });
  };

  return (
    <Card className="border border-gray-200">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Grid3X3 className="h-5 w-5 text-primary" />
          <span>Matriz de Eisenhower</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(priorityConfig).map(([priority, config]) => (
            <div
              key={priority}
              className={`${config.bgColor} border-2 ${config.borderColor} rounded-lg p-4`}
            >
              <h3 className={`font-medium ${config.textColor} mb-2 text-sm`}>
                {config.title}
              </h3>
              <div className="space-y-2">
                {(groupedTasks[priority] || []).map((task) => (
                  <div
                    key={task.id}
                    className={`bg-white p-2 rounded ${config.borderClass} cursor-pointer hover:shadow-sm transition-shadow ${
                      task.status === "completed" ? "opacity-60" : ""
                    }`}
                    onClick={() => handleTaskClick(task.id, task.status)}
                  >
                    <p className={`text-xs text-gray-700 ${
                      task.status === "completed" ? "line-through" : ""
                    }`}>
                      {task.title}
                    </p>
                    <div className="flex items-center justify-between mt-1">
                      <span className={`text-xs ${config.textColor}`}>
                        {moodEmojis[priority]} {task.emotionalState || "Estado"}
                      </span>
                      {task.status === "completed" && (
                        <span className="text-xs text-secondary">✓</span>
                      )}
                    </div>
                  </div>
                ))}
                {(!groupedTasks[priority] || groupedTasks[priority].length === 0) && (
                  <div className="bg-white p-2 rounded border-l-4 border-gray-200 opacity-50">
                    <p className="text-xs text-gray-400 italic">Sin tareas</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
