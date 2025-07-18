import { useState } from "react";
import { Heart, Lightbulb, StopCircle, Eye, Play, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface DailyEmotionalCheckProps {
  selectedDate: Date;
}

const trafficLightActions = [
  { action: "stop", label: "PARA", icon: StopCircle, color: "bg-destructive hover:bg-red-600" },
  { action: "think", label: "PIENSA", icon: Eye, color: "bg-accent hover:bg-yellow-500" },
  { action: "act", label: "ACTÚA", icon: Play, color: "bg-secondary hover:bg-green-600" },
];

const emergencyStrategies = [
  {
    title: "Respiración 4-7-8",
    description: "Inhala 4 seg, mantén 7 seg, exhala 8 seg",
    icon: "🫁",
  },
  {
    title: "Técnica 5-4-3-2-1",
    description: "5 cosas que ves, 4 que tocas, 3 que oyes, 2 que hueles, 1 que saboreas",
    icon: "👁️",
  },
  {
    title: "Movimiento rápido",
    description: "10 saltos, estiramientos o caminar 2 minutos",
    icon: "🏃",
  },
];

export default function DailyEmotionalCheck({ selectedDate }: DailyEmotionalCheckProps) {
  const [selectedStrategy, setSelectedStrategy] = useState<number | null>(null);
  const { toast } = useToast();

  const handleTrafficLightAction = (action: string) => {
    const messages = {
      stop: "PARAR: Respira profundo. Detente un momento. ¿Qué está pasando ahora mismo?",
      think: "PENSAR: ¿Cuáles son mis opciones? ¿Qué haría mi mejor versión de mí mismo?",
      act: "ACTUAR: Elige la acción más pequeña que puedas hacer ahora mismo y hazla.",
    };

    toast({
      title: `Técnica del Semáforo: ${action.toUpperCase()}`,
      description: messages[action as keyof typeof messages],
      duration: 8000,
    });
  };

  const handleEmergencyStrategy = (strategy: typeof emergencyStrategies[0], index: number) => {
    setSelectedStrategy(index);
    toast({
      title: `Estrategia activada: ${strategy.title}`,
      description: strategy.description,
      duration: 10000,
    });
  };

  const handleQuickEmergency = () => {
    toast({
      title: "🚨 Plan de Emergencia Activado",
      description: "1. Respira 3 veces profundo\n2. Identifica UNA tarea mínima\n3. Hazla en los próximos 5 minutos",
      duration: 15000,
    });
  };

  return (
    <Card className="border border-gray-200">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Heart className="h-5 w-5 text-destructive" />
            <span>Regulación Emocional</span>
          </div>
          <div className="text-sm text-gray-600">
            {format(selectedDate, "dd/MM", { locale: es })}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Traffic Light Technique */}
        <div>
          <h3 className="font-medium text-gray-900 mb-3 flex items-center">
            <Lightbulb className="h-4 w-4 mr-2" />
            Técnica del Semáforo
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {trafficLightActions.map(({ action, label, icon: Icon, color }) => (
              <Button
                key={action}
                onClick={() => handleTrafficLightAction(action)}
                className={`${color} text-white traffic-light-button`}
                size="sm"
              >
                <Icon className="h-4 w-4 mr-1" />
                {label}
              </Button>
            ))}
          </div>
        </div>

        {/* Emergency Strategies */}
        <div>
          <h3 className="font-medium text-gray-900 mb-3 flex items-center">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Estrategias de Emergencia
          </h3>
          <div className="space-y-2">
            {emergencyStrategies.map((strategy, index) => (
              <button
                key={index}
                onClick={() => handleEmergencyStrategy(strategy, index)}
                className={`w-full text-left p-3 rounded-lg border transition-all ${
                  selectedStrategy === index
                    ? 'border-primary bg-calm-blue'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-lg">{strategy.icon}</span>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{strategy.title}</div>
                    <div className="text-xs text-gray-600">{strategy.description}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Quick Emergency Button */}
        <div className="pt-4 border-t border-gray-200">
          <Button
            onClick={handleQuickEmergency}
            className="w-full bg-error-light text-destructive hover:bg-red-100 border border-destructive"
            variant="outline"
          >
            <AlertTriangle className="h-4 w-4 mr-2" />
            🚨 Activar Plan de Emergencia
          </Button>
        </div>

        {/* Daily Emotional Tip */}
        <div className="bg-success-light rounded-lg p-4">
          <h4 className="font-medium text-secondary mb-2">💡 Consejo del día</h4>
          <p className="text-sm text-gray-700">
            {selectedDate.toDateString() === new Date().toDateString() 
              ? "Recuerda: tus emociones son válidas. No hay emociones 'buenas' o 'malas', solo información sobre cómo te sientes."
              : "Las emociones son temporales. Lo que sientes ahora no es lo que sentirás siempre."}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}