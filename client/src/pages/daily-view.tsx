import { useState } from "react";
import { Calendar, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import DailyTaskManager from "@/components/daily-task-manager";
import DailyMoodTracker from "@/components/daily-mood-tracker";
import DailyFocusSession from "@/components/daily-focus-session";
import DailyEmotionalCheck from "@/components/daily-emotional-check";
import { format, addDays, subDays } from "date-fns";
import { es } from "date-fns/locale";

export default function DailyView() {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const formatDate = (date: Date) => {
    return format(date, "EEEE, d 'de' MMMM", { locale: es });
  };

  const goToPreviousDay = () => {
    setSelectedDate(subDays(selectedDate, 1));
  };

  const goToNextDay = () => {
    setSelectedDate(addDays(selectedDate, 1));
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Dashboard
                </Button>
              </Link>
              <div className="flex items-center space-x-2">
                <Calendar className="h-8 w-8 text-primary" />
                <h1 className="text-xl font-semibold text-gray-900">Vista Diaria</h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link href="/weekly">
                <Button variant="outline" size="sm">
                  Vista Semanal
                </Button>
              </Link>
              <Link href="/analysis">
                <Button variant="outline" size="sm">
                  Análisis
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Date Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="outline"
            onClick={goToPreviousDay}
            className="flex items-center space-x-2"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Día anterior</span>
          </Button>
          
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-900 capitalize">
              {formatDate(selectedDate)}
            </h2>
            {isToday(selectedDate) && (
              <span className="text-sm text-primary font-medium">Hoy</span>
            )}
          </div>
          
          <Button
            variant="outline"
            onClick={goToNextDay}
            className="flex items-center space-x-2"
          >
            <span>Día siguiente</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Daily Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            <DailyFocusSession selectedDate={selectedDate} />
            <DailyTaskManager selectedDate={selectedDate} />
          </div>
          
          {/* Right Column */}
          <div className="space-y-6">
            <DailyMoodTracker selectedDate={selectedDate} />
            <DailyEmotionalCheck selectedDate={selectedDate} />
          </div>
        </div>
      </div>
    </div>
  );
}