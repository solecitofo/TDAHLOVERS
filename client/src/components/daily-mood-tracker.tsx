import { useState } from "react";
import { Heart, TrendingUp, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEmotions } from "@/hooks/use-emotions";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface DailyMoodTrackerProps {
  selectedDate: Date;
}

const moodOptions = [
  { id: "very-sad", emoji: "😢", label: "Muy triste", color: "bg-red-100" },
  { id: "sad", emoji: "😕", label: "Triste", color: "bg-orange-100" },
  { id: "neutral", emoji: "😐", label: "Normal", color: "bg-gray-100" },
  { id: "happy", emoji: "😊", label: "Feliz", color: "bg-green-100" },
  { id: "very-happy", emoji: "😄", label: "Muy feliz", color: "bg-green-200" },
];

export default function DailyMoodTracker({ selectedDate }: DailyMoodTrackerProps) {
  const { moodEntries } = useEmotions();
  const [selectedMood, setSelectedMood] = useState<string>("neutral");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Filter mood entries for the selected date
  const dailyMoods = moodEntries?.filter(entry => {
    const entryDate = new Date(entry.timestamp!);
    return entryDate.toDateString() === selectedDate.toDateString();
  }) || [];

  const createMoodEntryMutation = useMutation({
    mutationFn: async (moodData: { mood: string; emotionalState?: string; notes?: string }) => {
      const response = await apiRequest("POST", "/api/mood-entries", moodData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mood-entries"] });
      toast({
        title: "Estado emocional registrado",
        description: "Tu estado de ánimo ha sido guardado para hoy",
      });
    },
  });

  const handleMoodSelect = (moodId: string) => {
    setSelectedMood(moodId);
    const selectedMoodOption = moodOptions.find(m => m.id === moodId);
    
    createMoodEntryMutation.mutate({
      mood: moodId,
      emotionalState: selectedMoodOption?.emoji,
      notes: `Registro para ${format(selectedDate, "dd/MM/yyyy")}`,
    });
  };

  const latestMoodToday = dailyMoods[0];
  const moodCount = dailyMoods.length;

  return (
    <Card className="border border-gray-200">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Heart className="h-5 w-5 text-destructive" />
            <span>Estado Emocional</span>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">{format(selectedDate, "dd/MM", { locale: es })}</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Mood Selection */}
        <div>
          <p className="text-sm text-gray-600 mb-3">¿Cómo te sientes hoy?</p>
          <div className="grid grid-cols-5 gap-2">
            {moodOptions.map((mood) => (
              <button
                key={mood.id}
                onClick={() => handleMoodSelect(mood.id)}
                className={`flex flex-col items-center space-y-1 p-3 rounded-lg hover:bg-gray-50 transition-all ${
                  selectedMood === mood.id 
                    ? 'bg-accent/20 border-2 border-accent' 
                    : 'border border-gray-200'
                }`}
              >
                <span className="text-2xl">{mood.emoji}</span>
                <span className="text-xs text-gray-600">{mood.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Today's Mood History */}
        {dailyMoods.length > 0 && (
          <div className="pt-4 border-t border-gray-200">
            <h3 className="font-medium text-gray-900 mb-3 flex items-center">
              <TrendingUp className="h-4 w-4 mr-2" />
              Registro de hoy ({moodCount} {moodCount === 1 ? 'entrada' : 'entradas'})
            </h3>
            <div className="space-y-2">
              {dailyMoods.slice(0, 3).map((entry, index) => {
                const moodOption = moodOptions.find(m => m.id === entry.mood);
                return (
                  <div
                    key={entry.id}
                    className={`flex items-center space-x-3 p-3 rounded-lg ${moodOption?.color || 'bg-gray-100'}`}
                  >
                    <span className="text-lg">{entry.emotionalState || moodOption?.emoji}</span>
                    <div className="flex-1">
                      <span className="text-sm text-gray-700">{moodOption?.label}</span>
                      <div className="text-xs text-gray-500">
                        {format(new Date(entry.timestamp!), "HH:mm")}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Daily Summary */}
        {latestMoodToday && (
          <div className="bg-calm-blue rounded-lg p-4">
            <h4 className="font-medium text-primary mb-2">Resumen del día</h4>
            <p className="text-sm text-gray-700">
              {latestMoodToday.mood === "very-happy" || latestMoodToday.mood === "happy" 
                ? "¡Qué bueno que tengas un día positivo!"
                : latestMoodToday.mood === "neutral"
                ? "Un día normal, recuerda cuidarte."
                : "Recuerda que es normal tener días difíciles. ¿Necesitas usar alguna técnica de regulación emocional?"}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}