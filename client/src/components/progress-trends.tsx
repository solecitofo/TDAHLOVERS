import { TrendingUp, Calendar, BarChart3, ArrowUp, ArrowDown, Minus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTasks } from "@/hooks/use-tasks";
import { useEmotions } from "@/hooks/use-emotions";
import { useQuery } from "@tanstack/react-query";
import { isWithinInterval, subWeeks } from "date-fns";
import type { PomodoroSession } from "@shared/schema";

interface ProgressTrendsProps {
  weekStart: Date;
  weekEnd: Date;
}

export default function ProgressTrends({ weekStart, weekEnd }: ProgressTrendsProps) {
  const { tasks } = useTasks();
  const { moodEntries } = useEmotions();
  const { data: sessions } = useQuery<PomodoroSession[]>({
    queryKey: ["/api/pomodoro-sessions"],
  });

  const previousWeekStart = subWeeks(weekStart, 1);
  const previousWeekEnd = subWeeks(weekEnd, 1);

  // Current week data
  const currentWeekTasks = tasks?.filter(task => {
    const taskDate = new Date(task.createdAt!);
    return isWithinInterval(taskDate, { start: weekStart, end: weekEnd });
  }) || [];

  const currentWeekMoods = moodEntries?.filter(entry => {
    const entryDate = new Date(entry.timestamp!);
    return isWithinInterval(entryDate, { start: weekStart, end: weekEnd });
  }) || [];

  const currentWeekSessions = sessions?.filter(session => {
    const sessionDate = new Date(session.startedAt!);
    return isWithinInterval(sessionDate, { start: weekStart, end: weekEnd });
  }) || [];

  // Previous week data
  const previousWeekTasks = tasks?.filter(task => {
    const taskDate = new Date(task.createdAt!);
    return isWithinInterval(taskDate, { start: previousWeekStart, end: previousWeekEnd });
  }) || [];

  const previousWeekMoods = moodEntries?.filter(entry => {
    const entryDate = new Date(entry.timestamp!);
    return isWithinInterval(entryDate, { start: previousWeekStart, end: previousWeekEnd });
  }) || [];

  const previousWeekSessions = sessions?.filter(session => {
    const sessionDate = new Date(session.startedAt!);
    return isWithinInterval(sessionDate, { start: previousWeekStart, end: previousWeekEnd });
  }) || [];

  // Calculate metrics
  const moodValues = { "very-sad": 1, "sad": 2, "neutral": 3, "happy": 4, "very-happy": 5 };

  const currentMetrics = {
    taskCompletion: currentWeekTasks.length > 0 ? (currentWeekTasks.filter(task => task.status === "completed").length / currentWeekTasks.length) * 100 : 0,
    averageMood: currentWeekMoods.length > 0 ? currentWeekMoods.reduce((sum, entry) => sum + moodValues[entry.mood as keyof typeof moodValues], 0) / currentWeekMoods.length : 0,
    focusTime: currentWeekSessions.filter(session => session.completed && session.type === "work").reduce((sum, session) => sum + session.duration, 0),
    totalTasks: currentWeekTasks.length,
    moodEntries: currentWeekMoods.length,
    focusSessions: currentWeekSessions.filter(session => session.completed).length,
  };

  const previousMetrics = {
    taskCompletion: previousWeekTasks.length > 0 ? (previousWeekTasks.filter(task => task.status === "completed").length / previousWeekTasks.length) * 100 : 0,
    averageMood: previousWeekMoods.length > 0 ? previousWeekMoods.reduce((sum, entry) => sum + moodValues[entry.mood as keyof typeof moodValues], 0) / previousWeekMoods.length : 0,
    focusTime: previousWeekSessions.filter(session => session.completed && session.type === "work").reduce((sum, session) => sum + session.duration, 0),
    totalTasks: previousWeekTasks.length,
    moodEntries: previousWeekMoods.length,
    focusSessions: previousWeekSessions.filter(session => session.completed).length,
  };

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) return <ArrowUp className="h-4 w-4 text-secondary" />;
    if (current < previous) return <ArrowDown className="h-4 w-4 text-destructive" />;
    return <Minus className="h-4 w-4 text-gray-400" />;
  };

  const getTrendColor = (current: number, previous: number) => {
    if (current > previous) return "text-secondary";
    if (current < previous) return "text-destructive";
    return "text-gray-500";
  };

  const getPercentageChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? "+100%" : "0%";
    const change = ((current - previous) / previous) * 100;
    return change > 0 ? `+${change.toFixed(1)}%` : `${change.toFixed(1)}%`;
  };

  const trends = [
    {
      label: "Completación de tareas",
      current: currentMetrics.taskCompletion,
      previous: previousMetrics.taskCompletion,
      unit: "%",
      icon: "📋",
    },
    {
      label: "Estado emocional",
      current: currentMetrics.averageMood,
      previous: previousMetrics.averageMood,
      unit: "/5",
      icon: "😊",
    },
    {
      label: "Tiempo de enfoque",
      current: currentMetrics.focusTime,
      previous: previousMetrics.focusTime,
      unit: " min",
      icon: "🎯",
    },
    {
      label: "Tareas creadas",
      current: currentMetrics.totalTasks,
      previous: previousMetrics.totalTasks,
      unit: "",
      icon: "📝",
    },
    {
      label: "Registros emocionales",
      current: currentMetrics.moodEntries,
      previous: previousMetrics.moodEntries,
      unit: "",
      icon: "❤️",
    },
    {
      label: "Sesiones completadas",
      current: currentMetrics.focusSessions,
      previous: previousMetrics.focusSessions,
      unit: "",
      icon: "⏰",
    },
  ];

  return (
    <Card className="border border-gray-200">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          <span>Tendencias de Progreso</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Comparison Header */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-medium">Comparación con semana anterior</span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <ArrowUp className="h-3 w-3 text-secondary" />
              <span className="text-xs text-secondary">Mejora</span>
            </div>
            <div className="flex items-center space-x-1">
              <ArrowDown className="h-3 w-3 text-destructive" />
              <span className="text-xs text-destructive">Disminución</span>
            </div>
            <div className="flex items-center space-x-1">
              <Minus className="h-3 w-3 text-gray-400" />
              <span className="text-xs text-gray-500">Sin cambio</span>
            </div>
          </div>
        </div>

        {/* Trend Items */}
        <div className="grid grid-cols-2 gap-4">
          {trends.map((trend, index) => (
            <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{trend.icon}</span>
                  <span className="text-sm font-medium text-gray-700">{trend.label}</span>
                </div>
                {getTrendIcon(trend.current, trend.previous)}
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xl font-bold text-gray-900">
                    {trend.unit === "%" ? trend.current.toFixed(1) : 
                     trend.unit === "/5" ? trend.current.toFixed(1) : 
                     Math.round(trend.current)}
                    {trend.unit}
                  </div>
                  <div className="text-xs text-gray-500">
                    Anterior: {trend.unit === "%" ? trend.previous.toFixed(1) : 
                              trend.unit === "/5" ? trend.previous.toFixed(1) : 
                              Math.round(trend.previous)}
                    {trend.unit}
                  </div>
                </div>
                <div className={`text-sm font-medium ${getTrendColor(trend.current, trend.previous)}`}>
                  {getPercentageChange(trend.current, trend.previous)}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary Insights */}
        <div className="bg-calm-blue rounded-lg p-4">
          <h4 className="font-medium text-primary mb-2 flex items-center">
            <BarChart3 className="h-4 w-4 mr-2" />
            Análisis de tendencias
          </h4>
          <div className="space-y-2 text-sm text-gray-700">
            {currentMetrics.taskCompletion > previousMetrics.taskCompletion && (
              <div className="flex items-center space-x-2">
                <ArrowUp className="h-3 w-3 text-secondary" />
                <span>Mejora en productividad: {getPercentageChange(currentMetrics.taskCompletion, previousMetrics.taskCompletion)} más tareas completadas</span>
              </div>
            )}
            {currentMetrics.averageMood > previousMetrics.averageMood && (
              <div className="flex items-center space-x-2">
                <ArrowUp className="h-3 w-3 text-secondary" />
                <span>Estado emocional más positivo esta semana</span>
              </div>
            )}
            {currentMetrics.focusTime > previousMetrics.focusTime && (
              <div className="flex items-center space-x-2">
                <ArrowUp className="h-3 w-3 text-secondary" />
                <span>Aumento en tiempo de enfoque: {Math.round((currentMetrics.focusTime - previousMetrics.focusTime) / 60)}h más</span>
              </div>
            )}
            {currentMetrics.moodEntries > previousMetrics.moodEntries && (
              <div className="flex items-center space-x-2">
                <ArrowUp className="h-3 w-3 text-secondary" />
                <span>Mayor constancia en el seguimiento emocional</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}