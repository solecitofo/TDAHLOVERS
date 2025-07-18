import { useState, useEffect, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function usePomodoro(taskId?: number) {
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [sessionDuration, setSessionDuration] = useState(25);
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createSessionMutation = useMutation({
    mutationFn: async (sessionData: any) => {
      const response = await apiRequest("POST", "/api/pomodoro-sessions", sessionData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pomodoro-sessions"] });
    },
  });

  const updateSessionMutation = useMutation({
    mutationFn: async ({ id, ...updates }: { id: number } & any) => {
      const response = await apiRequest("PATCH", `/api/pomodoro-sessions/${id}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pomodoro-sessions"] });
    },
  });

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      
      if (isBreak) {
        toast({
          title: "¡Descanso terminado!",
          description: "Es hora de volver al trabajo",
        });
        setIsBreak(false);
        setTimeLeft(25 * 60);
      } else {
        toast({
          title: "¡Pomodoro completado!",
          description: "Toma un descanso de 5 minutos",
        });
        setIsBreak(true);
        setTimeLeft(5 * 60);
      }
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, isBreak, toast]);

  const startTimer = useCallback((customDuration?: number) => {
    const duration = customDuration || sessionDuration;
    setSessionDuration(duration);
    setTimeLeft(duration * 60);
    setIsRunning(true);
    
    // Create pomodoro session record
    if (taskId) {
      createSessionMutation.mutate({
        taskId,
        duration,
        type: isBreak ? "break" : "work",
      });
    }
  }, [sessionDuration, isBreak, taskId, createSessionMutation]);

  const pauseTimer = useCallback(() => {
    setIsRunning(false);
  }, []);

  const resetTimer = useCallback(() => {
    setIsRunning(false);
    setTimeLeft(sessionDuration * 60);
  }, [sessionDuration]);

  const progress = 1 - (timeLeft / (sessionDuration * 60));

  return {
    timeLeft,
    isRunning,
    isBreak,
    progress,
    startTimer,
    pauseTimer,
    resetTimer,
  };
}
