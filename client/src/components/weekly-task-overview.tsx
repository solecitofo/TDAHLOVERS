import { CheckSquare, Clock, TrendingUp, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useTasks } from "@/hooks/use-tasks";
import { format, isWithinInterval } from "date-fns";
import { es } from "date-fns/locale";

interface WeeklyTaskOverviewProps {
  weekStart: Date;
  weekEnd: Date;
}

export default function WeeklyTaskOverview({ weekStart, weekEnd }: WeeklyTaskOverviewProps) {
  const { tasks } = useTasks();
  
  const weeklyTasks = tasks?.filter(task => {
    const taskDate = new Date(task.createdAt!);
    return isWithinInterval(taskDate, { start: weekStart, end: weekEnd });
  }) || [];

  const completedTasks = weeklyTasks.filter(task => task.status === "completed");
  const inProgressTasks = weeklyTasks.filter(task => task.status === "in-progress");
  const pendingTasks = weeklyTasks.filter(task => task.status === "pending");

  const completionRate = weeklyTasks.length > 0 ? (completedTasks.length / weeklyTasks.length) * 100 : 0;

  const totalEstimatedMinutes = weeklyTasks.reduce((sum, task) => sum + (task.estimatedMinutes || 0), 0);
  const totalActualMinutes = completedTasks.reduce((sum, task) => sum + (task.actualMinutes || 0), 0);

  const dayStats = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + i);
    
    const dayTasks = weeklyTasks.filter(task => {
      const taskDate = new Date(task.createdAt!);
      return taskDate.toDateString() === date.toDateString();
    });
    
    const dayCompleted = dayTasks.filter(task => task.status === "completed");
    
    dayStats.push({
      date,
      total: dayTasks.length,
      completed: dayCompleted.length,
      completionRate: dayTasks.length > 0 ? (dayCompleted.length / dayTasks.length) * 100 : 0,
    });
  }

  return (
    <Card className="border border-gray-200">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <CheckSquare className="h-5 w-5 text-primary" />
          <span>Resumen Semanal de Tareas</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Weekly Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{weeklyTasks.length}</div>
            <div className="text-sm text-gray-600">Total tareas</div>
          </div>
          <div className="text-center p-4 bg-success-light rounded-lg">
            <div className="text-2xl font-bold text-secondary">{completedTasks.length}</div>
            <div className="text-sm text-gray-600">Completadas</div>
          </div>
          <div className="text-center p-4 bg-warning-light rounded-lg">
            <div className="text-2xl font-bold text-accent">{inProgressTasks.length}</div>
            <div className="text-sm text-gray-600">En progreso</div>
          </div>
          <div className="text-center p-4 bg-error-light rounded-lg">
            <div className="text-2xl font-bold text-destructive">{pendingTasks.length}</div>
            <div className="text-sm text-gray-600">Pendientes</div>
          </div>
        </div>

        {/* Completion Rate */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Tasa de completación</span>
            <span className="text-sm font-medium text-secondary">{Math.round(completionRate)}%</span>
          </div>
          <Progress value={completionRate} className="h-3" />
        </div>

        {/* Time Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-calm-blue p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Target className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Tiempo estimado</span>
            </div>
            <div className="text-xl font-bold text-primary">
              {Math.round(totalEstimatedMinutes / 60)}h {totalEstimatedMinutes % 60}m
            </div>
          </div>
          <div className="bg-success-light p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Clock className="h-4 w-4 text-secondary" />
              <span className="text-sm font-medium">Tiempo real</span>
            </div>
            <div className="text-xl font-bold text-secondary">
              {Math.round(totalActualMinutes / 60)}h {totalActualMinutes % 60}m
            </div>
          </div>
        </div>

        {/* Daily Breakdown */}
        <div>
          <h3 className="font-medium text-gray-900 mb-3 flex items-center">
            <TrendingUp className="h-4 w-4 mr-2" />
            Progreso diario
          </h3>
          <div className="space-y-2">
            {dayStats.map((day, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium w-16">
                    {format(day.date, "EEE", { locale: es })}
                  </span>
                  <span className="text-sm text-gray-600">
                    {format(day.date, "dd/MM")}
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">
                      {day.completed}/{day.total}
                    </span>
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-secondary h-2 rounded-full"
                        style={{ width: `${day.completionRate}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-sm font-medium text-secondary w-8">
                    {Math.round(day.completionRate)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}