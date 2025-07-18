import { Target, Clock, Zap, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { isWithinInterval } from "date-fns";
import type { PomodoroSession } from "@shared/schema";

interface WeeklyFocusStatsProps {
  weekStart: Date;
  weekEnd: Date;
}

export default function WeeklyFocusStats({ weekStart, weekEnd }: WeeklyFocusStatsProps) {
  const { data: sessions } = useQuery<PomodoroSession[]>({
    queryKey: ["/api/pomodoro-sessions"],
  });

  const weeklySessions = sessions?.filter(session => {
    const sessionDate = new Date(session.startedAt!);
    return isWithinInterval(sessionDate, { start: weekStart, end: weekEnd });
  }) || [];

  const completedSessions = weeklySessions.filter(session => session.completed);
  const workSessions = completedSessions.filter(session => session.type === "work");
  const breakSessions = completedSessions.filter(session => session.type === "break");

  const totalFocusTime = workSessions.reduce((sum, session) => sum + session.duration, 0);
  const totalBreakTime = breakSessions.reduce((sum, session) => sum + session.duration, 0);

  const averageSessionLength = workSessions.length > 0 
    ? totalFocusTime / workSessions.length 
    : 0;

  const completionRate = weeklySessions.length > 0 
    ? (completedSessions.length / weeklySessions.length) * 100 
    : 0;

  // Calculate daily focus stats
  const dailyStats = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + i);
    
    const daySessions = completedSessions.filter(session => {
      const sessionDate = new Date(session.startedAt!);
      return sessionDate.toDateString() === date.toDateString();
    });
    
    const dayFocusTime = daySessions
      .filter(session => session.type === "work")
      .reduce((sum, session) => sum + session.duration, 0);
    
    dailyStats.push({
      date,
      focusTime: dayFocusTime,
      sessions: daySessions.length,
    });
  }

  const maxDailyFocus = Math.max(...dailyStats.map(d => d.focusTime));
  const bestDay = dailyStats.find(d => d.focusTime === maxDailyFocus);

  return (
    <Card className="border border-gray-200">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Target className="h-5 w-5 text-primary" />
          <span>Estadísticas de Enfoque</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-primary/10 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Clock className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Tiempo total</span>
            </div>
            <div className="text-2xl font-bold text-primary">
              {Math.floor(totalFocusTime / 60)}h {totalFocusTime % 60}m
            </div>
          </div>
          <div className="bg-secondary/10 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Zap className="h-4 w-4 text-secondary" />
              <span className="text-sm font-medium">Sesiones</span>
            </div>
            <div className="text-2xl font-bold text-secondary">
              {workSessions.length}
            </div>
          </div>
        </div>

        {/* Completion Rate */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Tasa de finalización</span>
            <span className="text-sm font-medium text-secondary">{Math.round(completionRate)}%</span>
          </div>
          <Progress value={completionRate} className="h-3" />
          <p className="text-xs text-gray-500 mt-1">
            {completedSessions.length} de {weeklySessions.length} sesiones completadas
          </p>
        </div>

        {/* Average Session */}
        <div className="bg-accent/10 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Promedio por sesión</span>
            <Clock className="h-4 w-4 text-accent" />
          </div>
          <div className="text-xl font-bold text-accent">
            {Math.round(averageSessionLength)} minutos
          </div>
        </div>

        {/* Daily Focus Chart */}
        <div>
          <h3 className="font-medium text-gray-900 mb-3 flex items-center">
            <TrendingUp className="h-4 w-4 mr-2" />
            Enfoque diario
          </h3>
          <div className="space-y-2">
            {dailyStats.map((day, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="w-8 text-sm font-medium text-gray-700">
                  {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'][day.date.getDay()]}
                </div>
                <div className="flex-1 bg-gray-200 rounded-full h-4">
                  <div
                    className="bg-primary h-4 rounded-full flex items-center justify-center"
                    style={{ 
                      width: maxDailyFocus > 0 ? `${(day.focusTime / maxDailyFocus) * 100}%` : '0%',
                      minWidth: day.focusTime > 0 ? '8px' : '0px'
                    }}
                  >
                    {day.focusTime > 0 && (
                      <span className="text-xs font-medium text-white">
                        {day.focusTime}m
                      </span>
                    )}
                  </div>
                </div>
                <div className="w-8 text-xs text-gray-500">
                  {day.sessions}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Insights */}
        <div className="bg-calm-blue rounded-lg p-4">
          <h4 className="font-medium text-primary mb-2">🎯 Insights de la semana</h4>
          <div className="space-y-1 text-sm text-gray-700">
            <div>
              • Mejor día: {bestDay ? ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'][bestDay.date.getDay()] : 'N/A'} 
              ({maxDailyFocus} min)
            </div>
            <div>
              • Tiempo de descanso: {totalBreakTime} minutos
            </div>
            <div>
              • Ratio trabajo/descanso: {totalBreakTime > 0 ? (totalFocusTime / totalBreakTime).toFixed(1) : 'N/A'}:1
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}