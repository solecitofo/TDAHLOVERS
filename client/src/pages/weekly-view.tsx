import { useState } from "react";
import { Calendar, ChevronLeft, ChevronRight, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import WeeklyTaskOverview from "@/components/weekly-task-overview";
import WeeklyMoodChart from "@/components/weekly-mood-chart";
import WeeklyFocusStats from "@/components/weekly-focus-stats";
import WeeklyRoutineBoard from "@/components/weekly-routine-board";
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks } from "date-fns";
import { es } from "date-fns/locale";

export default function WeeklyView() {
  const [selectedWeek, setSelectedWeek] = useState(new Date());

  const weekStart = startOfWeek(selectedWeek, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(selectedWeek, { weekStartsOn: 1 });

  const formatWeekRange = (start: Date, end: Date) => {
    const startStr = format(start, "d 'de' MMMM", { locale: es });
    const endStr = format(end, "d 'de' MMMM", { locale: es });
    return `${startStr} - ${endStr}`;
  };

  const goToPreviousWeek = () => {
    setSelectedWeek(subWeeks(selectedWeek, 1));
  };

  const goToNextWeek = () => {
    setSelectedWeek(addWeeks(selectedWeek, 1));
  };

  const isCurrentWeek = (date: Date) => {
    const today = new Date();
    const currentWeekStart = startOfWeek(today, { weekStartsOn: 1 });
    const selectedWeekStart = startOfWeek(date, { weekStartsOn: 1 });
    return currentWeekStart.toDateString() === selectedWeekStart.toDateString();
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
                <h1 className="text-xl font-semibold text-gray-900">Vista Semanal</h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link href="/daily">
                <Button variant="outline" size="sm">
                  Vista Diaria
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

      {/* Week Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="outline"
            onClick={goToPreviousWeek}
            className="flex items-center space-x-2"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Semana anterior</span>
          </Button>
          
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-900">
              {formatWeekRange(weekStart, weekEnd)}
            </h2>
            {isCurrentWeek(selectedWeek) && (
              <span className="text-sm text-primary font-medium">Semana actual</span>
            )}
          </div>
          
          <Button
            variant="outline"
            onClick={goToNextWeek}
            className="flex items-center space-x-2"
          >
            <span>Semana siguiente</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Weekly Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            <WeeklyTaskOverview weekStart={weekStart} weekEnd={weekEnd} />
            <WeeklyRoutineBoard weekStart={weekStart} />
          </div>
          
          {/* Right Column */}
          <div className="space-y-6">
            <WeeklyFocusStats weekStart={weekStart} weekEnd={weekEnd} />
            <WeeklyMoodChart weekStart={weekStart} weekEnd={weekEnd} />
          </div>
        </div>
      </div>
    </div>
  );
}