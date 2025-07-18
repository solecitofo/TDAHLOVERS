import { useState } from "react";
import { Brain, Sparkles, TrendingUp, TrendingDown, AlertCircle, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { Task, MoodEntry, PomodoroSession } from "@shared/schema";

interface AIInsightsProps {
  weekStart: Date;
  weekEnd: Date;
}

export default function AIInsights({ weekStart, weekEnd }: AIInsightsProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [insights, setInsights] = useState<any>(null);

  const { data: tasks } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  const { data: moods } = useQuery<MoodEntry[]>({
    queryKey: ["/api/mood-entries"],
  });

  const { data: sessions } = useQuery<PomodoroSession[]>({
    queryKey: ["/api/pomodoro-sessions"],
  });

  const generateInsights = async () => {
    setIsGenerating(true);
    
    // Simulate AI analysis (in real implementation, this would call an AI service)
    setTimeout(() => {
      const weeklyTasks = tasks?.filter(task => {
        const taskDate = new Date(task.createdAt!);
        return taskDate >= weekStart && taskDate <= weekEnd;
      }) || [];

      const weeklyMoods = moods?.filter(mood => {
        const moodDate = new Date(mood.timestamp!);
        return moodDate >= weekStart && moodDate <= weekEnd;
      }) || [];

      const weeklySessions = sessions?.filter(session => {
        const sessionDate = new Date(session.startedAt!);
        return sessionDate >= weekStart && sessionDate <= weekEnd;
      }) || [];

      // Generate insights based on data
      const completedTasks = weeklyTasks.filter(task => task.status === "completed");
      const averageMood = weeklyMoods.length > 0 
        ? weeklyMoods.reduce((sum, mood) => {
            const moodValues = { "very-sad": 1, "sad": 2, "neutral": 3, "happy": 4, "very-happy": 5 };
            return sum + moodValues[mood.mood as keyof typeof moodValues];
          }, 0) / weeklyMoods.length
        : 3;

      const totalFocusTime = weeklySessions
        .filter(session => session.completed && session.type === "work")
        .reduce((sum, session) => sum + session.duration, 0);

      const generatedInsights = {
        summary: generateSummary(weeklyTasks, averageMood, totalFocusTime),
        positives: generatePositives(completedTasks, averageMood, totalFocusTime),
        challenges: generateChallenges(weeklyTasks, averageMood, weeklySessions),
        recommendations: generateRecommendations(weeklyTasks, averageMood, totalFocusTime),
        weeklyScore: calculateWeeklyScore(weeklyTasks, averageMood, totalFocusTime),
      };

      setInsights(generatedInsights);
      setIsGenerating(false);
    }, 2000);
  };

  const generateSummary = (tasks: Task[], avgMood: number, focusTime: number) => {
    const completedTasks = tasks.filter(task => task.status === "completed");
    const completionRate = tasks.length > 0 ? (completedTasks.length / tasks.length) * 100 : 0;

    return `Esta semana has completado ${completedTasks.length} de ${tasks.length} tareas (${Math.round(completionRate)}% de tasa de finalización). Tu estado emocional promedio fue ${avgMood.toFixed(1)}/5.0, y dedicaste ${Math.round(focusTime / 60)} horas a sesiones de enfoque estructurado.`;
  };

  const generatePositives = (completedTasks: Task[], avgMood: number, focusTime: number) => {
    const positives = [];
    
    if (completedTasks.length >= 5) {
      positives.push("Excelente productividad - completaste múltiples tareas esta semana");
    }
    
    if (avgMood >= 3.5) {
      positives.push("Mantuviste un estado emocional positivo durante la semana");
    }
    
    if (focusTime >= 180) { // 3 hours
      positives.push("Dedicaste tiempo significativo a sesiones de enfoque estructurado");
    }
    
    if (positives.length === 0) {
      positives.push("Has mostrado perseverancia al mantener tu rutina de seguimiento");
    }
    
    return positives;
  };

  const generateChallenges = (tasks: Task[], avgMood: number, sessions: PomodoroSession[]) => {
    const challenges = [];
    const incompleteTasks = tasks.filter(task => task.status !== "completed");
    const incompleteSessions = sessions.filter(session => !session.completed);
    
    if (incompleteTasks.length > tasks.length * 0.5) {
      challenges.push("Alta proporción de tareas incompletas - considera usar más la técnica de descomposición");
    }
    
    if (avgMood < 2.5) {
      challenges.push("Estado emocional bajo - recuerda usar las técnicas de regulación emocional");
    }
    
    if (incompleteSessions.length > sessions.length * 0.3) {
      challenges.push("Dificultad para completar sesiones de enfoque - prueba con intervalos más cortos");
    }
    
    if (challenges.length === 0) {
      challenges.push("Los patrones muestran oportunidades para optimizar la gestión del tiempo");
    }
    
    return challenges;
  };

  const generateRecommendations = (tasks: Task[], avgMood: number, focusTime: number) => {
    const recommendations = [];
    
    if (focusTime < 60) {
      recommendations.push("Incrementa gradualmente las sesiones de enfoque - empieza con 15 minutos diarios");
    }
    
    if (avgMood < 3.0) {
      recommendations.push("Prioriza las técnicas de regulación emocional y considera aumentar los descansos");
    }
    
    const urgentTasks = tasks.filter(task => task.priority === "urgent-important");
    if (urgentTasks.length > 3) {
      recommendations.push("Hay demasiadas tareas urgentes - practica la planificación anticipada");
    }
    
    recommendations.push("Continúa con el registro consistente para identificar patrones más precisos");
    
    return recommendations;
  };

  const calculateWeeklyScore = (tasks: Task[], avgMood: number, focusTime: number) => {
    const completedTasks = tasks.filter(task => task.status === "completed");
    const taskScore = tasks.length > 0 ? (completedTasks.length / tasks.length) * 40 : 0;
    const moodScore = (avgMood / 5) * 30;
    const focusScore = Math.min((focusTime / 300) * 30, 30); // Max 5 hours for full score
    
    return Math.round(taskScore + moodScore + focusScore);
  };

  return (
    <Card className="border border-gray-200">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Brain className="h-5 w-5 text-primary" />
            <span>Análisis Inteligente</span>
          </div>
          <div className="text-sm text-gray-600">
            {format(weekStart, "'Semana del' dd/MM", { locale: es })}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {!insights ? (
          <div className="text-center py-8">
            <div className="mb-4">
              <Sparkles className="h-12 w-12 text-primary mx-auto mb-2" />
              <p className="text-gray-600">
                Genera un análisis inteligente de tu semana usando patrones de TCC para TDAH
              </p>
            </div>
            <Button
              onClick={generateInsights}
              disabled={isGenerating}
              className="bg-primary text-white hover:bg-blue-600"
            >
              {isGenerating ? (
                <>
                  <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                  Analizando...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4 mr-2" />
                  Generar Análisis
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Weekly Score */}
            <div className="bg-primary/10 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-primary">Puntuación Semanal</span>
                <span className="text-3xl font-bold text-primary">{insights.weeklyScore}/100</span>
              </div>
              <div className="text-sm text-gray-600">
                Basado en productividad, bienestar emocional y enfoque
              </div>
            </div>

            {/* Summary */}
            <div>
              <h3 className="font-medium text-gray-900 mb-2">📊 Resumen de la semana</h3>
              <p className="text-sm text-gray-700">{insights.summary}</p>
            </div>

            {/* Positives */}
            <div>
              <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                <CheckCircle className="h-4 w-4 mr-2 text-secondary" />
                Aspectos positivos
              </h3>
              <div className="space-y-2">
                {insights.positives.map((positive: string, index: number) => (
                  <div key={index} className="flex items-start space-x-2">
                    <TrendingUp className="h-4 w-4 text-secondary mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{positive}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Challenges */}
            <div>
              <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                <AlertCircle className="h-4 w-4 mr-2 text-accent" />
                Desafíos identificados
              </h3>
              <div className="space-y-2">
                {insights.challenges.map((challenge: string, index: number) => (
                  <div key={index} className="flex items-start space-x-2">
                    <TrendingDown className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{challenge}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div>
              <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                <Sparkles className="h-4 w-4 mr-2 text-primary" />
                Recomendaciones personalizadas
              </h3>
              <div className="space-y-2">
                {insights.recommendations.map((rec: string, index: number) => (
                  <div key={index} className="flex items-start space-x-2">
                    <span className="text-primary mt-0.5 flex-shrink-0">→</span>
                    <span className="text-sm text-gray-700">{rec}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Regenerate Button */}
            <div className="pt-4 border-t border-gray-200">
              <Button
                onClick={generateInsights}
                disabled={isGenerating}
                variant="outline"
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                    Regenerando...
                  </>
                ) : (
                  <>
                    <Brain className="h-4 w-4 mr-2" />
                    Actualizar Análisis
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}