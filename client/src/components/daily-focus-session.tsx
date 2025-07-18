import { useState } from "react";
import { Target, Play, Pause, RotateCcw, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { usePomodoro } from "@/hooks/use-pomodoro";
import { useTasks } from "@/hooks/use-tasks";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface DailyFocusSessionProps {
  selectedDate: Date;
}

export default function DailyFocusSession({ selectedDate }: DailyFocusSessionProps) {
  const { tasks } = useTasks();
  const [selectedTaskId, setSelectedTaskId] = useState<number | undefined>();
  
  // Filter tasks for the selected date
  const dailyTasks = tasks?.filter(task => {
    const taskDate = new Date(task.createdAt!);
    return taskDate.toDateString() === selectedDate.toDateString() && task.status !== "completed";
  }) || [];

  const currentTask = dailyTasks.find(task => task.id === selectedTaskId) || dailyTasks[0];
  
  const { 
    timeLeft, 
    isRunning, 
    isBreak, 
    startTimer, 
    pauseTimer, 
    resetTimer,
    progress 
  } = usePomodoro(currentTask?.id);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const circumference = 2 * Math.PI * 45; // radius = 45
  const strokeDashoffset = circumference - (progress * circumference);

  return (
    <Card className="border border-gray-200">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-primary" />
            <span>Sesión de Enfoque</span>
          </div>
          <div className="text-sm text-gray-600">
            {format(selectedDate, "dd/MM", { locale: es })}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Task Selection */}
        {dailyTasks.length > 0 && (
          <div>
            <p className="text-sm text-gray-600 mb-3">Selecciona una tarea para enfocar:</p>
            <div className="space-y-2">
              {dailyTasks.slice(0, 3).map((task) => (
                <button
                  key={task.id}
                  onClick={() => setSelectedTaskId(task.id)}
                  className={`w-full text-left p-3 rounded-lg border transition-all ${
                    selectedTaskId === task.id || (!selectedTaskId && task.id === currentTask?.id)
                      ? 'border-primary bg-calm-blue'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{task.title}</span>
                    {task.estimatedMinutes && (
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3 text-gray-400" />
                        <span className="text-xs text-gray-500">{task.estimatedMinutes} min</span>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Pomodoro Timer */}
        {currentTask ? (
          <div className="bg-calm-blue rounded-lg p-6">
            <div className="text-center mb-4">
              <h3 className="font-medium text-gray-900 mb-2">
                {isBreak ? 'Tiempo de Descanso' : 'Enfocándote en:'}
              </h3>
              {!isBreak && (
                <p className="text-sm text-gray-600">{currentTask.title}</p>
              )}
            </div>
            
            <div className="flex items-center justify-center mb-6">
              <div className="relative w-32 h-32">
                <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="45" 
                    stroke="rgba(66, 133, 244, 0.2)" 
                    strokeWidth="6" 
                    fill="none"
                  />
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="45" 
                    stroke="#4285F4" 
                    strokeWidth="6" 
                    fill="none" 
                    strokeLinecap="round" 
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    className="pomodoro-timer"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl font-semibold text-primary">
                    {formatTime(timeLeft)}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex justify-center space-x-3">
              <Button
                onClick={() => startTimer()}
                disabled={isRunning}
                className="bg-primary text-white hover:bg-blue-600"
                size="sm"
              >
                <Play className="h-4 w-4 mr-1" />
                {isBreak ? 'Iniciar Descanso' : 'Iniciar Enfoque'}
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
              <Button
                onClick={resetTimer}
                variant="outline"
                size="sm"
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                Reiniciar
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">
              {dailyTasks.length === 0 
                ? "No hay tareas para este día" 
                : "Selecciona una tarea para empezar"}
            </p>
            <Button 
              className="bg-primary text-white hover:bg-blue-600"
              onClick={() => startTimer(25)}
            >
              <Play className="h-4 w-4 mr-2" />
              Sesión libre de 25 min
            </Button>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Button 
            variant="outline"
            onClick={() => startTimer(5)}
            className="flex items-center justify-center space-x-2"
          >
            <Clock className="h-4 w-4" />
            <span>5 min</span>
          </Button>
          <Button 
            variant="outline"
            onClick={() => startTimer(15)}
            className="flex items-center justify-center space-x-2"
          >
            <Clock className="h-4 w-4" />
            <span>15 min</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}