import { useState } from "react";
import { CheckSquare, Plus, Clock, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useTasks } from "@/hooks/use-tasks";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { TaskStep } from "@shared/schema";

interface DailyTaskManagerProps {
  selectedDate: Date;
}

export default function DailyTaskManager({ selectedDate }: DailyTaskManagerProps) {
  const { tasks } = useTasks();
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Filter tasks for the selected date
  const dailyTasks = tasks?.filter(task => {
    const taskDate = new Date(task.createdAt!);
    return taskDate.toDateString() === selectedDate.toDateString();
  }) || [];

  const createTaskMutation = useMutation({
    mutationFn: async (taskData: any) => {
      const response = await apiRequest("POST", "/api/tasks", taskData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      setNewTaskTitle("");
      setIsDialogOpen(false);
      toast({
        title: "Tarea creada",
        description: "La tarea ha sido agregada para hoy",
      });
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, ...updates }: { id: number } & any) => {
      const response = await apiRequest("PATCH", `/api/tasks/${id}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
    },
  });

  const handleCreateTask = () => {
    if (!newTaskTitle.trim()) return;

    const steps: TaskStep[] = [
      { id: "1", title: "Revisar qué necesito", estimatedMinutes: 2, completed: false },
      { id: "2", title: "Hacer la tarea", estimatedMinutes: 15, completed: false },
      { id: "3", title: "Revisar resultado", estimatedMinutes: 3, completed: false },
    ];

    createTaskMutation.mutate({
      title: newTaskTitle,
      description: `Tarea para ${format(selectedDate, "dd/MM/yyyy")}`,
      priority: "not-urgent-important",
      estimatedMinutes: steps.reduce((sum, step) => sum + step.estimatedMinutes, 0),
      steps,
      minimalViableTask: `Solo empezar: ${newTaskTitle}`,
    });
  };

  const handleTaskToggle = (taskId: number, currentStatus: string) => {
    const newStatus = currentStatus === "completed" ? "pending" : "completed";
    updateTaskMutation.mutate({ id: taskId, status: newStatus });
  };

  const completedTasks = dailyTasks.filter(task => task.status === "completed");
  const pendingTasks = dailyTasks.filter(task => task.status !== "completed");

  return (
    <Card className="border border-gray-200">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckSquare className="h-5 w-5 text-primary" />
            <span>Tareas del Día</span>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-white hover:bg-blue-600" size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Agregar
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nueva Tarea para {format(selectedDate, "dd/MM/yyyy")}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="¿Qué necesitas hacer hoy?"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleCreateTask()}
                />
                <Button
                  onClick={handleCreateTask}
                  disabled={!newTaskTitle.trim()}
                  className="w-full"
                >
                  Crear Tarea
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Pending Tasks */}
        <div>
          <h3 className="font-medium text-gray-900 mb-3">Pendientes ({pendingTasks.length})</h3>
          <div className="space-y-2">
            {pendingTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <button
                  onClick={() => handleTaskToggle(task.id, task.status)}
                  className="text-gray-400 hover:text-primary"
                >
                  <CheckSquare className="h-5 w-5" />
                </button>
                <div className="flex-1">
                  <span className="text-sm text-gray-900">{task.title}</span>
                  {task.estimatedMinutes && (
                    <div className="flex items-center space-x-1 mt-1">
                      <Clock className="h-3 w-3 text-gray-400" />
                      <span className="text-xs text-gray-500">{task.estimatedMinutes} min</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  {task.status === "in-progress" && (
                    <div className="flex items-center space-x-1">
                      <Target className="h-3 w-3 text-accent" />
                      <span className="text-xs text-accent">En progreso</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Completed Tasks */}
        {completedTasks.length > 0 && (
          <div>
            <h3 className="font-medium text-gray-900 mb-3">Completadas ({completedTasks.length})</h3>
            <div className="space-y-2">
              {completedTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center space-x-3 p-3 bg-success-light rounded-lg opacity-75"
                >
                  <button
                    onClick={() => handleTaskToggle(task.id, task.status)}
                    className="text-secondary"
                  >
                    <CheckSquare className="h-5 w-5" />
                  </button>
                  <div className="flex-1">
                    <span className="text-sm text-gray-700 line-through">{task.title}</span>
                    {task.actualMinutes && (
                      <div className="flex items-center space-x-1 mt-1">
                        <Clock className="h-3 w-3 text-gray-400" />
                        <span className="text-xs text-gray-500">{task.actualMinutes} min reales</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {dailyTasks.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">No hay tareas para este día</p>
            <Button
              onClick={() => setIsDialogOpen(true)}
              className="bg-primary text-white hover:bg-blue-600"
            >
              Crear primera tarea
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}