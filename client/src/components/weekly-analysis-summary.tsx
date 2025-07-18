import { BarChart3, TrendingUp, Clock, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useTasks } from "@/hooks/use-tasks";
import { useEmotions } from "@/hooks/use-emotions";
import { useQuery } from "@tanstack/react-query";
import { isWithinInterval } from "date-fns";
import type { PomodoroSession } from "@shared/schema";

interface WeeklyAnalysisSummaryProps {
  weekStart: Date;
  weekEnd: Date;
}

export default function WeeklyAnalysisSummary({ weekStart, weekEnd }: WeeklyAnalysisSummaryProps) {
  const { tasks } = useTasks();
  const { moodEntries } = useEmotions();
  const { data: sessions } = useQuery<PomodoroSession[]>({
    queryKey: ["/api/pomodoro-sessions"],
  });

  const weeklyTasks = tasks?.filter(task => {
    const taskDate = new Date(task.createdAt!);
    return isWithinInterval(taskDate, { start: weekStart, end: weekEnd });
  }) || [];

  const weeklyMoods = moodEntries?.filter(entry => {
    const entryDate = new Date(entry.timestamp!);
    return isWithinInterval(entryDate, { start: weekStart, end: weekEnd });
  }) || [];

  const weeklySessions = sessions?.filter(session => {
    const sessionDate = new Date(session.startedAt!);
    return isWithinInterval(sessionDate, { start: weekStart, end: weekEnd });
  }) || [];

  // Calculate metrics
  const completedTasks = weeklyTasks.filter(task => task.status === "completed");
  const taskCompletionRate = weeklyTasks.length > 0 ? (completedTasks.length / weeklyTasks.length) * 100 : 0;

  const moodValues = { "very-sad": 1, "sad": 2, "neutral": 3, "happy": 4, "very-happy": 5 };
  const averageMood = weeklyMoods.length > 0 
    ? weeklyMoods.reduce((sum, entry) => sum + moodValues[entry.mood as keyof typeof moodValues], 0) / weeklyMoods.length
    : 0;

  const completedSessions = weeklySessions.filter(session => session.completed);
  const sessionCompletionRate = weeklySessions.length > 0 ? (completedSessions.length / weeklySessions.length) * 100 : 0;

  const totalFocusTime = completedSessions
    .filter(session => session.type === "work")
    .reduce((sum, session) => sum + session.duration, 0);

  const priorityDistribution = {
    "urgent-important": weeklyTasks.filter(task => task.priority === "urgent-important").length,
    "not-urgent-important": weeklyTasks.filter(task => task.priority === "not-urgent-important").length,
    "urgent-not-important": weeklyTasks.filter(task => task.priority === "urgent-not-important").length,
    "not-urgent-not-important": weeklyTasks.filter(task => task.priority === "not-urgent-not-important").length,
  };

  const getPerformanceLevel = (score: number) => {
    if (score >= 80) return { level: "Excelente", color: "text-secondary", bg: "bg-success-light" };
    if (score >= 60) return { level: "Bueno", color: "text-primary", bg: "bg-calm-blue" };
    if (score >= 40) return { level: "Regular", color: "text-accent", bg: "bg-warning-light" };
    return { level: "Necesita mejorar", color: "text-destructive", bg: "bg-error-light" };
  };

  const moodPerformance = getPerformanceLevel((averageMood / 5) * 100);
  const taskPerformance = getPerformanceLevel(taskCompletionRate);
  const focusPerformance = getPerformanceLevel(sessionCompletionRate);

  return (
    <Card className="border border-gray-200">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          <span>Resumen de Rendimiento</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-3 gap-4">
          <div className={`p-4 rounded-lg ${taskPerformance.bg}`}>
            <div className="flex items-center justify-between mb-2">
              <Target className="h-4 w-4 text-gray-600" />
              <span className={`text-sm font-medium ${taskPerformance.color}`}>
                {taskPerformance.level}
              </span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{Math.round(taskCompletionRate)}%</div>
            <div className="text-sm text-gray-600">Tareas completadas</div>
          </div>

          <div className={`p-4 rounded-lg ${moodPerformance.bg}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-lg">😊</span>
              <span className={`text-sm font-medium ${moodPerformance.color}`}>
                {moodPerformance.level}
              </span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{averageMood.toFixed(1)}/5</div>
            <div className="text-sm text-gray-600">Estado emocional</div>
          </div>

          <div className={`p-4 rounded-lg ${focusPerformance.bg}`}>
            <div className="flex items-center justify-between mb-2">
              <Clock className="h-4 w-4 text-gray-600" />
              <span className={`text-sm font-medium ${focusPerformance.color}`}>
                {focusPerformance.level}
              </span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{Math.round(sessionCompletionRate)}%</div>
            <div className="text-sm text-gray-600">Sesiones completadas</div>
          </div>
        </div>

        {/* Detailed Progress */}
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Productividad general</span>
              <span className="text-sm text-gray-600">
                {completedTasks.length} de {weeklyTasks.length} tareas
              </span>
            </div>
            <Progress value={taskCompletionRate} className="h-2" />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Bienestar emocional</span>
              <span className="text-sm text-gray-600">
                {weeklyMoods.length} registros emocionales
              </span>
            </div>
            <Progress value={(averageMood / 5) * 100} className="h-2" />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Constancia en enfoque</span>
              <span className="text-sm text-gray-600">
                {Math.round(totalFocusTime / 60)}h {totalFocusTime % 60}m total
              </span>
            </div>
            <Progress value={sessionCompletionRate} className="h-2" />
          </div>
        </div>

        {/* Priority Distribution */}
        <div>
          <h3 className="font-medium text-gray-900 mb-3 flex items-center">
            <TrendingUp className="h-4 w-4 mr-2" />
            Distribución de prioridades
          </h3>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center justify-between p-2 bg-error-light rounded">
              <span className="text-sm">Urgente + Importante</span>
              <span className="text-sm font-medium text-destructive">
                {priorityDistribution["urgent-important"]}
              </span>
            </div>
            <div className="flex items-center justify-between p-2 bg-success-light rounded">
              <span className="text-sm">No Urgente + Importante</span>
              <span className="text-sm font-medium text-secondary">
                {priorityDistribution["not-urgent-important"]}
              </span>
            </div>
            <div className="flex items-center justify-between p-2 bg-warning-light rounded">
              <span className="text-sm">Urgente + No Importante</span>
              <span className="text-sm font-medium text-accent">
                {priorityDistribution["urgent-not-important"]}
              </span>
            </div>
            <div className="flex items-center justify-between p-2 bg-gray-100 rounded">
              <span className="text-sm">No Urgente + No Importante</span>
              <span className="text-sm font-medium text-gray-600">
                {priorityDistribution["not-urgent-not-important"]}
              </span>
            </div>
          </div>
        </div>

        {/* Weekly Highlights */}
        <div className="bg-primary/5 rounded-lg p-4">
          <h4 className="font-medium text-primary mb-2">🎯 Highlights de la semana</h4>
          <div className="space-y-1 text-sm text-gray-700">
            <div>• Mayor productividad: {taskCompletionRate >= 70 ? "Excelente gestión de tareas" : "Oportunidad de mejora en productividad"}</div>
            <div>• Estado emocional: {averageMood >= 3.5 ? "Bienestar emocional estable" : "Considera usar más técnicas de regulación"}</div>
            <div>• Enfoque: {sessionCompletionRate >= 60 ? "Buena adherencia a sesiones" : "Practica intervalos más cortos"}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}