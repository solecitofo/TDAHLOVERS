import { useState } from "react";
import { CheckSquare, Circle, PlayCircle, Plus, Lightbulb, Rocket } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useTasks } from "@/hooks/use-tasks";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { TaskStep } from "@shared/schema";

export default function TaskBreakdownCard() {
  const { tasks } = useTasks();
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const activeTask = tasks?.find(task => task.status === "in-progress") || tasks?.[0];

  const createTaskMutation = useMutation({
    mutationFn: async (taskData: any) => {
      const response = await apiRequest("POST", "/api/tasks", taskData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      setNewTaskTitle("");
      setNewTaskDescription("");
      setIsDialogOpen(false);
      toast({
        title: "Tarea creada",
        description: "La tarea ha sido descompuesta automáticamente",
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

    // Auto-generate steps for task decomposition
    const steps: TaskStep[] = [
      { id: "1", title: "Revisar recursos necesarios", estimatedMinutes: 3, completed: false },
      { id: "2", title: "Crear esquema básico", estimatedMinutes: 5, completed: false },
      { id: "3", title: "Desarrollar primer punto", estimatedMinutes: 10, completed: false },
      { id: "4", title: "Revisar y refinar", estimatedMinutes: 8, completed: false },
    ];

    createTaskMutation.mutate({
      title: newTaskTitle,
      description: newTaskDescription,
      priority: "not-urgent-important",
      estimatedMinutes: steps.reduce((sum, step) => sum + step.estimatedMinutes, 0),
      steps,
      minimalViableTask: `Abre el documento y escribe solo el título: "${newTaskTitle}"`,
    });
  };

  const handleStepComplete = (stepId: string) => {
    if (!activeTask) return;

    const updatedSteps = activeTask.steps?.map((step: TaskStep) =>
      step.id === stepId
        ? { ...step, completed: true, completedAt: new Date().toISOString() }
        : step
    ) || [];

    const completedSteps = updatedSteps.filter((step: TaskStep) => step.completed).length;
    const totalSteps = updatedSteps.length;
    
    updateTaskMutation.mutate({
      id: activeTask.id,
      steps: updatedSteps,
      currentStepIndex: completedSteps,
      status: completedSteps === totalSteps ? "completed" : activeTask.status,
    });

    if (completedSteps === totalSteps) {
      toast({
        title: "¡Tarea completada!",
        description: "Has completado todos los pasos de la tarea",
      });
    }
  };

  const handleStartTMV = () => {
    if (!activeTask?.minimalViableTask) return;

    toast({
      title: "Tarea Mínima Viable iniciada",
      description: activeTask.minimalViableTask,
      duration: 8000,
    });

    updateTaskMutation.mutate({
      id: activeTask.id,
      status: "in-progress",
    });
  };

  return (
    <Card className="border border-gray-200">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckSquare className="h-5 w-5 text-primary" />
            <span>Descomposición de Tareas</span>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-white hover:bg-blue-600" size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Nueva Tarea
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Crear Nueva Tarea</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Título de la tarea"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                />
                <Textarea
                  placeholder="Descripción (opcional)"
                  value={newTaskDescription}
                  onChange={(e) => setNewTaskDescription(e.target.value)}
                />
                <Button
                  onClick={handleCreateTask}
                  disabled={!newTaskTitle.trim()}
                  className="w-full"
                >
                  Crear y Descomponer Tarea
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {activeTask ? (
          <>
            {/* Active Task Breakdown */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-gray-900">{activeTask.title}</h3>
                <span className="text-sm text-gray-500">
                  {activeTask.steps?.filter((step: TaskStep) => step.completed).length || 0} de{" "}
                  {activeTask.steps?.length || 0} completados
                </span>
              </div>
              
              <div className="space-y-2">
                {activeTask.steps?.map((step: TaskStep, index: number) => {
                  const isCompleted = step.completed;
                  const isCurrent = index === (activeTask.currentStepIndex || 0) && !isCompleted;
                  
                  return (
                    <div
                      key={step.id}
                      className={`flex items-center space-x-3 p-3 rounded-lg transition-all ${
                        isCompleted
                          ? 'bg-success-light task-step-completed'
                          : isCurrent
                          ? 'bg-accent/20 border-2 border-accent'
                          : 'bg-gray-50'
                      }`}
                    >
                      <button
                        onClick={() => !isCompleted && handleStepComplete(step.id)}
                        disabled={isCompleted}
                        className="text-lg"
                      >
                        {isCompleted ? (
                          <CheckSquare className="h-5 w-5 text-secondary" />
                        ) : isCurrent ? (
                          <PlayCircle className="h-5 w-5 text-accent" />
                        ) : (
                          <Circle className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                      <span
                        className={`text-sm flex-1 ${
                          isCompleted
                            ? 'text-gray-700 line-through'
                            : isCurrent
                            ? 'text-gray-900 font-medium'
                            : 'text-gray-500'
                        }`}
                      >
                        {step.title}
                      </span>
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          isCompleted
                            ? 'text-secondary bg-white'
                            : isCurrent
                            ? 'text-accent bg-white'
                            : 'text-gray-400 bg-white'
                        }`}
                      >
                        {step.estimatedMinutes} min
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Minimal Viable Task */}
            <div className="bg-calm-blue rounded-lg p-4">
              <h4 className="font-medium text-primary mb-2 flex items-center">
                <Lightbulb className="h-4 w-4 mr-2" />
                Tarea Mínima Viable (TMV)
              </h4>
              <p className="text-sm text-gray-700 mb-3">
                {activeTask.minimalViableTask || "Empieza con el paso más pequeño posible"}
              </p>
              <Button
                onClick={handleStartTMV}
                className="bg-primary text-white hover:bg-blue-600"
                size="sm"
              >
                <Rocket className="h-4 w-4 mr-1" />
                Empezar TMV
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">No hay tareas para descomponer</p>
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
