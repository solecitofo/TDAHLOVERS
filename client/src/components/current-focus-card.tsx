import { useState } from "react";
import { Target, Play, Pause, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { usePomodoro } from "@/hooks/use-pomodoro";
import { useTasks } from "@/hooks/use-tasks";

export default function CurrentFocusCard() {
  const { tasks } = useTasks();
  const currentTask = tasks?.find(task => task.status === "in-progress") || tasks?.[0];
  const { 
    timeLeft, 
    isRunning, 
    isBreak, 
    startTimer, 
    pauseTimer, 
    progress 
  } = usePomodoro(currentTask?.id);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const circumference = 2 * Math.PI * 40; // radius = 40
  const strokeDashoffset = circumference - (progress * circumference);

  return (
    <Card className="border border-gray-200">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-primary" />
            <span>Enfoque Actual</span>
          </div>
          {isRunning && (
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-secondary rounded-full animate-pulse"></div>
              <span className="text-sm text-secondary font-medium">Activo</span>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {currentTask ? (
          <>
            <div>
              <h3 className="font-medium text-gray-900 mb-2">{currentTask.title}</h3>
              <p className="text-sm text-gray-600">{currentTask.description}</p>
            </div>
            
            {/* Pomodoro Timer */}
            <div className="bg-calm-blue rounded-lg p-4">
              <div className="flex items-center justify-center mb-3">
                <div className="relative w-24 h-24">
                  <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                    <circle 
                      cx="50" 
                      cy="50" 
                      r="40" 
                      stroke="rgba(66, 133, 244, 0.2)" 
                      strokeWidth="8" 
                      fill="none"
                    />
                    <circle 
                      cx="50" 
                      cy="50" 
                      r="40" 
                      stroke="#4285F4" 
                      strokeWidth="8" 
                      fill="none" 
                      strokeLinecap="round" 
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      className="pomodoro-timer"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-semibold text-primary">
                      {formatTime(timeLeft)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex justify-center space-x-2">
                <Button
                  onClick={startTimer}
                  disabled={isRunning}
                  className="bg-primary text-white hover:bg-blue-600"
                  size="sm"
                >
                  <Play className="h-4 w-4 mr-1" />
                  {isBreak ? 'Iniciar Descanso' : 'Iniciar'}
                </Button>
                <Button
                  onClick={pauseTimer}
                  disabled={!isRunning}
                  variant="outline"
                  size="sm"
                >
                  <Pause className="h-4 w-4 mr-1" />
                  Pausar
                </Button>
              </div>
            </div>
            
            {/* 5-Minute Rule Button */}
            <Button 
              className="w-full bg-accent hover:bg-yellow-500 text-accent-foreground"
              onClick={() => {
                // Start a 5-minute focused session
                startTimer(5);
              }}
            >
              <Clock className="h-4 w-4 mr-2" />
              Empezar solo 5 minutos
            </Button>
          </>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">No hay tareas activas</p>
            <Button className="bg-primary text-white hover:bg-blue-600">
              Crear primera tarea
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
