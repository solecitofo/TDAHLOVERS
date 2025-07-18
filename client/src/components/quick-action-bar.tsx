import { Plus, Heart, Coffee } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function QuickActionBar() {
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [quickTaskTitle, setQuickTaskTitle] = useState("");
  const [showMoodCheck, setShowMoodCheck] = useState(false);
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createTaskMutation = useMutation({
    mutationFn: async (taskData: any) => {
      const response = await apiRequest("POST", "/api/tasks", taskData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      setShowQuickAdd(false);
      setQuickTaskTitle("");
      toast({
        title: "Tarea creada",
        description: "La tarea se ha agregado a tu lista",
      });
    },
  });

  const createMoodEntryMutation = useMutation({
    mutationFn: async (moodData: any) => {
      const response = await apiRequest("POST", "/api/mood-entries", moodData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mood-entries"] });
      setShowMoodCheck(false);
      toast({
        title: "Estado registrado",
        description: "Tu chequeo rápido ha sido guardado",
      });
    },
  });

  const handleQuickAddTask = () => {
    if (!quickTaskTitle.trim()) return;
    
    createTaskMutation.mutate({
      title: quickTaskTitle,
      priority: "not-urgent-important",
      estimatedMinutes: 15,
      steps: [
        { id: "1", title: "Comenzar tarea", estimatedMinutes: 15, completed: false }
      ],
      minimalViableTask: `Simplemente empezar: ${quickTaskTitle}`,
    });
  };

  const handleQuickMoodCheck = (mood: string) => {
    createMoodEntryMutation.mutate({
      mood,
      notes: "Chequeo rápido desde botón flotante",
    });
  };

  const handleQuickBreak = () => {
    toast({
      title: "Tiempo de descanso",
      description: "Respira profundo. Hidrátate. Estira por 2 minutos.",
      duration: 5000,
    });
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 space-y-3 z-40">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={() => setShowQuickAdd(true)}
              className="bg-primary text-white w-12 h-12 rounded-full shadow-lg hover:bg-blue-600 transition-colors"
              size="icon"
            >
              <Plus className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p>Agregar tarea rápida</p>
          </TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={() => setShowMoodCheck(true)}
              className="bg-secondary text-white w-12 h-12 rounded-full shadow-lg hover:bg-green-600 transition-colors"
              size="icon"
            >
              <Heart className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p>Chequeo rápido de estado</p>
          </TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={handleQuickBreak}
              className="bg-accent text-white w-12 h-12 rounded-full shadow-lg hover:bg-yellow-500 transition-colors"
              size="icon"
            >
              <Coffee className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p>Descanso rápido</p>
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Quick Add Task Dialog */}
      <Dialog open={showQuickAdd} onOpenChange={setShowQuickAdd}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar Tarea Rápida</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="¿Qué necesitas hacer?"
              value={quickTaskTitle}
              onChange={(e) => setQuickTaskTitle(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleQuickAddTask()}
              autoFocus
            />
            <Button
              onClick={handleQuickAddTask}
              disabled={!quickTaskTitle.trim()}
              className="w-full"
            >
              Agregar Tarea
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Quick Mood Check Dialog */}
      <Dialog open={showMoodCheck} onOpenChange={setShowMoodCheck}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Cómo te sientes?</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-5 gap-2">
            {[
              { id: "very-sad", emoji: "😢", label: "Muy triste" },
              { id: "sad", emoji: "😕", label: "Triste" },
              { id: "neutral", emoji: "😐", label: "Normal" },
              { id: "happy", emoji: "😊", label: "Feliz" },
              { id: "very-happy", emoji: "😄", label: "Muy feliz" },
            ].map((mood) => (
              <button
                key={mood.id}
                onClick={() => handleQuickMoodCheck(mood.id)}
                className="flex flex-col items-center space-y-1 p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <span className="text-3xl">{mood.emoji}</span>
                <span className="text-xs text-gray-600">{mood.label}</span>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
