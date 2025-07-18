import { useState } from "react";
import { Brain, ChevronLeft, Sparkles, TrendingUp, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import WeeklyAnalysisSummary from "@/components/weekly-analysis-summary";
import AIInsights from "@/components/ai-insights";
import ProgressTrends from "@/components/progress-trends";
import RecommendationsList from "@/components/recommendations-list";
import { format, startOfWeek, endOfWeek, subWeeks } from "date-fns";
import { es } from "date-fns/locale";

export default function AnalysisView() {
  const [selectedWeek, setSelectedWeek] = useState(subWeeks(new Date(), 1)); // Default to last week

  const weekStart = startOfWeek(selectedWeek, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(selectedWeek, { weekStartsOn: 1 });

  const formatWeekRange = (start: Date, end: Date) => {
    const startStr = format(start, "d 'de' MMMM", { locale: es });
    const endStr = format(end, "d 'de' MMMM", { locale: es });
    return `${startStr} - ${endStr}`;
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
                <Brain className="h-8 w-8 text-primary" />
                <h1 className="text-xl font-semibold text-gray-900">Análisis Semanal</h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link href="/daily">
                <Button variant="outline" size="sm">
                  Vista Diaria
                </Button>
              </Link>
              <Link href="/weekly">
                <Button variant="outline" size="sm">
                  Vista Semanal
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Analysis Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Análisis de la semana: {formatWeekRange(weekStart, weekEnd)}
          </h2>
          <p className="text-gray-600">
            Resumen inteligente de tu progreso, patrones y recomendaciones personalizadas
          </p>
        </div>

        {/* Analysis Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Analysis Column */}
          <div className="lg:col-span-2 space-y-6">
            <AIInsights weekStart={weekStart} weekEnd={weekEnd} />
            <WeeklyAnalysisSummary weekStart={weekStart} weekEnd={weekEnd} />
            <ProgressTrends weekStart={weekStart} weekEnd={weekEnd} />
          </div>
          
          {/* Recommendations Column */}
          <div className="space-y-6">
            <RecommendationsList weekStart={weekStart} weekEnd={weekEnd} />
            
            {/* Quick Stats */}
            <Card className="border border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <span>Estadísticas Rápidas</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-success-light rounded-lg">
                    <div className="text-2xl font-bold text-secondary">78%</div>
                    <div className="text-sm text-gray-600">Adherencia</div>
                  </div>
                  <div className="text-center p-3 bg-calm-blue rounded-lg">
                    <div className="text-2xl font-bold text-primary">12</div>
                    <div className="text-sm text-gray-600">Tareas completadas</div>
                  </div>
                  <div className="text-center p-3 bg-warning-light rounded-lg">
                    <div className="text-2xl font-bold text-accent">3.2</div>
                    <div className="text-sm text-gray-600">Horas de enfoque</div>
                  </div>
                  <div className="text-center p-3 bg-error-light rounded-lg">
                    <div className="text-2xl font-bold text-destructive">2</div>
                    <div className="text-sm text-gray-600">Días difíciles</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}