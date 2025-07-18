import { useState } from "react";
import { Heart, Lightbulb, LifeBuoy, StopCircle, Eye, Play } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEmotions } from "@/hooks/use-emotions";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface EmotionalRegulationCardProps {
  emergencyMode: boolean;
}

const moodOptions = [
  { id: "very-sad", emoji: "😢", label: "Muy triste" },
  { id: "sad", emoji: "😕", label: "Triste" },
  { id: "neutral", emoji: "😐", label: "Normal" },
  { id: "happy", emoji: "😊", label: "Feliz" },
  { id: "very-happy", emoji: "😄", label: "Muy feliz" },
];

const trafficLightActions = [
  { action: "stop", label: "PARA", icon: StopCircle, color: "bg-destructive hover:bg-red-600" },
  { action: "think", label: "PIENSA", icon: Lightbulb, color: "bg-accent hover:bg-yellow-500" },
  { action: "act", label: "ACTÚA", icon: Play, color: "bg-secondary hover:bg-green-600" },
];

export default function EmotionalRegulationCard({ emergencyMode }: EmotionalRegulationCardProps) {
  const [selectedMood, setSelectedMood] = useState<string>("neutral");
  const { latestMood } = useEmotions();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createMoodEntryMutation = useMutation({
    mutationFn: async (moodData: { mood: string; emotionalState?: string }) => {
      const response = await apiRequest("POST", "/api/mood-entries", moodData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mood-entries"] });
      toast({
        title: "Estado emocional registrado",
        description: "Tu estado de ánimo ha sido guardado",
      });
    },
  });

  const handleMoodSelect = (moodId: string) => {
    setSelectedMood(moodId);
    const selectedMoodOption = moodOptions.find(m => m.id === moodId);
    
    createMoodEntryMutation.mutate({
      mood: moodId,
      emotionalState: selectedMoodOption?.emoji,
    });
  };

  const handleTrafficLightAction = (action: string) => {
    const messages = {
      stop: "Pausa. Respira profundo. ¿Qué está pasando realmente?",
      think: "¿Cuáles son mis opciones? ¿Qué haría mi mejor versión?",
      act: "Elige la acción más pequeña y hazla ahora.",
    };

    toast({
      title: `Técnica del Semáforo: ${action.toUpperCase()}`,
      description: messages[action as keyof typeof messages],
      duration: 5000,
    });
  };

  const handleEmergencyPlan = () => {
    toast({
      title: "Plan de Emergencia Activado",
      description: "Respira 3 veces profundo. Identifica una tarea mínima. Actúa en 5 minutos.",
      duration: 10000,
    });
  };

  return (
    <Card className={`border border-gray-200 ${emergencyMode ? 'border-destructive border-2' : ''}`}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Heart className="h-5 w-5 text-destructive" />
          <span>Regulación Emocional</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Mood */}
        <div>
          <p className="text-sm text-gray-600 mb-3">¿Cómo te sientes ahora?</p>
          <div className="flex justify-between items-center">
            {moodOptions.map((mood) => (
              <button
                key={mood.id}
                onClick={() => handleMoodSelect(mood.id)}
                className={`flex flex-col items-center space-y-1 p-2 rounded-lg hover:bg-gray-50 transition-all ${
                  selectedMood === mood.id 
                    ? 'bg-accent/20 border-2 border-accent mood-selected' 
                    : ''
                }`}
              >
                <span className="text-2xl">{mood.emoji}</span>
                <span className={`text-xs ${
                  selectedMood === mood.id 
                    ? 'text-accent font-medium' 
                    : 'text-gray-500'
                }`}>
                  {mood.label}
                </span>
              </button>
            ))}
          </div>
        </div>
        
        {/* Traffic Light Technique */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-3 flex items-center">
            <Lightbulb className="h-4 w-4 mr-2" />
            Técnica del Semáforo
          </h3>
          <div className="flex space-x-2">
            {trafficLightActions.map(({ action, label, icon: Icon, color }) => (
              <Button
                key={action}
                onClick={() => handleTrafficLightAction(action)}
                className={`flex-1 ${color} text-white traffic-light-button`}
                size="sm"
              >
                <Icon className="h-4 w-4 mr-1" />
                {label}
              </Button>
            ))}
          </div>
        </div>
        
        {/* Emergency Plan */}
        <Button
          onClick={handleEmergencyPlan}
          className="w-full bg-error-light text-destructive hover:bg-red-100 border border-destructive"
          variant="outline"
        >
          <LifeBuoy className="h-4 w-4 mr-2" />
          Plan de Emergencia Emocional
        </Button>
      </CardContent>
    </Card>
  );
}
