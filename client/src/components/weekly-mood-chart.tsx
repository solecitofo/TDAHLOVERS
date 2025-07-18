import { Heart, TrendingUp, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEmotions } from "@/hooks/use-emotions";
import { format, isWithinInterval } from "date-fns";
import { es } from "date-fns/locale";

interface WeeklyMoodChartProps {
  weekStart: Date;
  weekEnd: Date;
}

const moodValues = {
  "very-sad": 1,
  "sad": 2,
  "neutral": 3,
  "happy": 4,
  "very-happy": 5,
};

const moodEmojis = {
  "very-sad": "😢",
  "sad": "😕",
  "neutral": "😐",
  "happy": "😊",
  "very-happy": "😄",
};

const moodLabels = {
  "very-sad": "Muy triste",
  "sad": "Triste",
  "neutral": "Normal",
  "happy": "Feliz",
  "very-happy": "Muy feliz",
};

export default function WeeklyMoodChart({ weekStart, weekEnd }: WeeklyMoodChartProps) {
  const { moodEntries } = useEmotions();
  
  const weeklyMoods = moodEntries?.filter(entry => {
    const entryDate = new Date(entry.timestamp!);
    return isWithinInterval(entryDate, { start: weekStart, end: weekEnd });
  }) || [];

  // Calculate daily mood averages
  const dailyMoods = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + i);
    
    const dayMoods = weeklyMoods.filter(entry => {
      const entryDate = new Date(entry.timestamp!);
      return entryDate.toDateString() === date.toDateString();
    });
    
    const avgMood = dayMoods.length > 0 
      ? dayMoods.reduce((sum, entry) => sum + moodValues[entry.mood as keyof typeof moodValues], 0) / dayMoods.length
      : 0;
    
    const dominantMood = dayMoods.length > 0 
      ? dayMoods.reduce((prev, current) => 
          dayMoods.filter(m => m.mood === current.mood).length > dayMoods.filter(m => m.mood === prev.mood).length 
            ? current 
            : prev
        ).mood
      : "neutral";
    
    dailyMoods.push({
      date,
      average: avgMood,
      count: dayMoods.length,
      dominant: dominantMood,
    });
  }

  const weeklyAverage = dailyMoods.length > 0 
    ? dailyMoods.reduce((sum, day) => sum + day.average, 0) / dailyMoods.filter(day => day.count > 0).length
    : 0;

  const maxHeight = 60; // px
  const chartHeight = maxHeight;

  return (
    <Card className="border border-gray-200">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Heart className="h-5 w-5 text-destructive" />
          <span>Estado Emocional Semanal</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Weekly Average */}
        <div className="bg-calm-blue rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-primary">Promedio semanal</span>
            <span className="text-lg">
              {weeklyAverage >= 4.5 ? "😄" : weeklyAverage >= 3.5 ? "😊" : weeklyAverage >= 2.5 ? "😐" : weeklyAverage >= 1.5 ? "😕" : "😢"}
            </span>
          </div>
          <div className="text-2xl font-bold text-primary">
            {weeklyAverage.toFixed(1)}/5.0
          </div>
          <div className="text-sm text-gray-600">
            {weeklyAverage >= 4 ? "Excelente semana emocional" : 
             weeklyAverage >= 3 ? "Semana equilibrada" : 
             weeklyAverage >= 2 ? "Semana con altibajos" : 
             "Semana difícil - considera usar más técnicas de regulación"}
          </div>
        </div>

        {/* Daily Mood Chart */}
        <div>
          <h3 className="font-medium text-gray-900 mb-3 flex items-center">
            <TrendingUp className="h-4 w-4 mr-2" />
            Progreso diario
          </h3>
          <div className="space-y-3">
            {dailyMoods.map((day, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="w-12 text-sm font-medium text-gray-700">
                  {format(day.date, "EEE", { locale: es })}
                </div>
                <div className="w-8 text-sm text-gray-500">
                  {format(day.date, "dd")}
                </div>
                <div className="flex-1 flex items-center space-x-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                    <div
                      className="bg-gradient-to-r from-red-300 via-yellow-300 to-green-300 h-6 rounded-full flex items-center justify-center"
                      style={{ width: `${(day.average / 5) * 100}%` }}
                    >
                      {day.count > 0 && (
                        <span className="text-xs font-medium text-white">
                          {day.average.toFixed(1)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="w-8 text-center">
                    {day.count > 0 ? moodEmojis[day.dominant as keyof typeof moodEmojis] : "⚪"}
                  </div>
                  <div className="w-8 text-xs text-gray-500">
                    {day.count > 0 ? day.count : "0"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Insights */}
        <div className="bg-success-light rounded-lg p-4">
          <h4 className="font-medium text-secondary mb-2">📊 Insights de la semana</h4>
          <div className="space-y-1 text-sm text-gray-700">
            <div>
              • Total de registros: {weeklyMoods.length}
            </div>
            <div>
              • Días con mejor estado: {dailyMoods.filter(d => d.average >= 4).length}
            </div>
            <div>
              • Días neutros: {dailyMoods.filter(d => d.average >= 2.5 && d.average < 4).length}
            </div>
            <div>
              • Días difíciles: {dailyMoods.filter(d => d.average > 0 && d.average < 2.5).length}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}