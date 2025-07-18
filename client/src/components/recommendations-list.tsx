import { Lightbulb, CheckCircle, AlertCircle, Target, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTasks } from "@/hooks/use-tasks";
import { useEmotions } from "@/hooks/use-emotions";
import { useQuery } from "@tanstack/react-query";
import { isWithinInterval } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import type { PomodoroSession } from "@shared/schema";

interface RecommendationsListProps {
  weekStart: Date;
  weekEnd: Date;
}

export default function RecommendationsList({ weekStart, weekEnd }: RecommendationsListProps) {
  const { tasks } = useTasks();
  const { moodEntries } = useEmotions();
  const { data: sessions } = useQuery<PomodoroSession[]>({
    queryKey: ["/api/pomodoro-sessions"],
  });
  const { toast } = useToast();

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

  // Generate recommendations based on data patterns
  const generateRecommendations = () => {
    const recommendations = [];

    // Task-based recommendations
    const completedTasks = weeklyTasks.filter(task => task.status === "completed");
    const taskCompletionRate = weeklyTasks.length > 0 ? (completedTasks.length / weeklyTasks.length) * 100 : 0;
    const urgentTasks = weeklyTasks.filter(task => task.priority === "urgent-important");

    if (taskCompletionRate < 50) {
      recommendations.push({
        id: 1,
        title: "Mejora la descomposición de tareas",
        description: "Divide las tareas grandes en pasos más pequeños usando la técnica MVT (Minimal Viable Task)",
        type: "productivity",
        priority: "high",
        action: "Crear pasos de 5-15 minutos máximo",
        icon: Target,
      });
    }

    if (urgentTasks.length > 3) {
      recommendations.push({
        id: 2,
        title: "Reduce las tareas urgentes",
        description: "Demasiadas tareas urgentes indica falta de planificación anticipada",
        type: "planning",
        priority: "medium",
        action: "Planifica actividades con 2-3 días de antelación",
        icon: AlertCircle,
      });
    }

    // Mood-based recommendations
    const moodValues = { "very-sad": 1, "sad": 2, "neutral": 3, "happy": 4, "very-happy": 5 };
    const averageMood = weeklyMoods.length > 0 
      ? weeklyMoods.reduce((sum, entry) => sum + moodValues[entry.mood as keyof typeof moodValues], 0) / weeklyMoods.length
      : 0;

    if (averageMood < 2.5) {
      recommendations.push({
        id: 3,
        title: "Prioriza el bienestar emocional",
        description: "Tu estado emocional necesita atención. Usa más técnicas de regulación",
        type: "emotional",
        priority: "high",
        action: "Práctica la técnica del semáforo 3 veces al día",
        icon: AlertCircle,
      });
    }

    if (weeklyMoods.length < 3) {
      recommendations.push({
        id: 4,
        title: "Aumenta el seguimiento emocional",
        description: "Registra tu estado emocional más frecuentemente para detectar patrones",
        type: "emotional",
        priority: "medium",
        action: "Registra tu estado al menos 2 veces al día",
        icon: CheckCircle,
      });
    }

    // Focus-based recommendations
    const completedSessions = weeklySessions.filter(session => session.completed);
    const sessionCompletionRate = weeklySessions.length > 0 ? (completedSessions.length / weeklySessions.length) * 100 : 0;
    const totalFocusTime = completedSessions
      .filter(session => session.type === "work")
      .reduce((sum, session) => sum + session.duration, 0);

    if (sessionCompletionRate < 60) {
      recommendations.push({
        id: 5,
        title: "Reduce la duración de sesiones",
        description: "Muchas sesiones incompletas indican que son demasiado largas",
        type: "focus",
        priority: "medium",
        action: "Usa intervalos de 15-20 minutos al principio",
        icon: Target,
      });
    }

    if (totalFocusTime < 120) { // Less than 2 hours
      recommendations.push({
        id: 6,
        title: "Incrementa el tiempo de enfoque",
        description: "Dedica más tiempo a sesiones de enfoque estructurado",
        type: "focus",
        priority: "low",
        action: "Objetivo: 30 minutos de enfoque diario",
        icon: Star,
      });
    }

    // General ADHD recommendations
    if (weeklyTasks.length > 0 && weeklyMoods.length > 0) {
      recommendations.push({
        id: 7,
        title: "Implementa rutinas de transición",
        description: "Las rutinas ayudan a reducir la carga cognitiva del TDAH",
        type: "routine",
        priority: "low",
        action: "Crea rutinas de 5 minutos entre actividades",
        icon: CheckCircle,
      });
    }

    return recommendations;
  };

  const recommendations = generateRecommendations();

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-error-light text-destructive";
      case "medium": return "bg-warning-light text-accent";
      case "low": return "bg-success-light text-secondary";
      default: return "bg-gray-100 text-gray-600";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "productivity": return "text-primary";
      case "emotional": return "text-destructive";
      case "focus": return "text-secondary";
      case "planning": return "text-accent";
      case "routine": return "text-purple-600";
      default: return "text-gray-600";
    }
  };

  const handleApplyRecommendation = (rec: any) => {
    toast({
      title: "Recomendación aplicada",
      description: `${rec.title}: ${rec.action}`,
      duration: 5000,
    });
  };

  return (
    <Card className="border border-gray-200">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Lightbulb className="h-5 w-5 text-accent" />
          <span>Recomendaciones Personalizadas</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {recommendations.length > 0 ? (
          <div className="space-y-4">
            {recommendations.map((rec) => {
              const IconComponent = rec.icon;
              return (
                <div key={rec.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <IconComponent className={`h-4 w-4 ${getTypeColor(rec.type)}`} />
                      <span className="font-medium text-sm">{rec.title}</span>
                    </div>
                    <Badge className={getPriorityColor(rec.priority)}>
                      {rec.priority === "high" ? "Alta" : rec.priority === "medium" ? "Media" : "Baja"}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3">{rec.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="bg-calm-blue px-3 py-1 rounded-full">
                      <span className="text-xs font-medium text-primary">
                        💡 {rec.action}
                      </span>
                    </div>
                    <Button
                      onClick={() => handleApplyRecommendation(rec)}
                      variant="outline"
                      size="sm"
                      className="text-xs"
                    >
                      Aplicar
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-secondary mx-auto mb-2" />
            <p className="text-gray-600 mb-2">¡Excelente trabajo!</p>
            <p className="text-sm text-gray-500">
              No hay recomendaciones específicas esta semana. Continúa con tus patrones actuales.
            </p>
          </div>
        )}

        {/* Weekly Tips */}
        <div className="pt-4 border-t border-gray-200">
          <h4 className="font-medium text-gray-900 mb-3">💡 Consejos semanales para TDAH</h4>
          <div className="space-y-2">
            <div className="bg-primary/5 p-3 rounded-lg">
              <div className="text-sm font-medium text-primary mb-1">Técnica de la semana</div>
              <div className="text-xs text-gray-700">
                Regla de los 5 minutos: Si una tarea te abruma, comprométete a hacerla solo 5 minutos. 
                Frecuentemente continuarás más tiempo del planeado.
              </div>
            </div>
            <div className="bg-secondary/5 p-3 rounded-lg">
              <div className="text-sm font-medium text-secondary mb-1">Recordatorio</div>
              <div className="text-xs text-gray-700">
                La consistencia es más importante que la perfección. Pequeños pasos diarios 
                son más efectivos que grandes esfuerzos esporádicos.
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}