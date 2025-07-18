import { Calendar, Check, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { RoutineBlock } from "@shared/schema";

interface WeeklyRoutineBoardProps {
  weekStart: Date;
}

const dayNames = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

export default function WeeklyRoutineBoard({ weekStart }: WeeklyRoutineBoardProps) {
  const { data: routineBlocks } = useQuery<RoutineBlock[]>({
    queryKey: ["/api/routine-blocks"],
    queryFn: () => fetch(`/api/routine-blocks?weekOf=${weekStart.toISOString()}`).then(r => r.json()),
  });

  const queryClient = useQueryClient();

  const updateRoutineMutation = useMutation({
    mutationFn: async ({ id, ...updates }: { id: number } & Partial<RoutineBlock>) => {
      const response = await apiRequest("PATCH", `/api/routine-blocks/${id}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/routine-blocks"] });
    },
  });

  const createRoutineMutation = useMutation({
    mutationFn: async (blockData: any) => {
      const response = await apiRequest("POST", "/api/routine-blocks", blockData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/routine-blocks"] });
    },
  });

  const handleToggleCompletion = (block: RoutineBlock) => {
    updateRoutineMutation.mutate({
      id: block.id,
      completed: !block.completed,
    });
  };

  const createSampleRoutine = () => {
    const sampleBlocks = [
      // Monday
      { dayOfWeek: 1, startHour: 9, endHour: 17, activity: "Trabajo", color: "bg-primary" },
      { dayOfWeek: 1, startHour: 18, endHour: 19, activity: "Ejercicio", color: "bg-secondary" },
      { dayOfWeek: 1, startHour: 20, endHour: 21, activity: "Relax", color: "bg-accent" },
      // Tuesday
      { dayOfWeek: 2, startHour: 9, endHour: 17, activity: "Trabajo", color: "bg-primary" },
      { dayOfWeek: 2, startHour: 18, endHour: 19, activity: "Terapia", color: "bg-purple-500" },
      { dayOfWeek: 2, startHour: 20, endHour: 21, activity: "Lectura", color: "bg-indigo-500" },
      // Wednesday
      { dayOfWeek: 3, startHour: 9, endHour: 17, activity: "Trabajo", color: "bg-primary" },
      { dayOfWeek: 3, startHour: 18, endHour: 19, activity: "Ejercicio", color: "bg-secondary" },
      { dayOfWeek: 3, startHour: 20, endHour: 21, activity: "Social", color: "bg-pink-500" },
      // Thursday
      { dayOfWeek: 4, startHour: 9, endHour: 17, activity: "Trabajo", color: "bg-primary" },
      { dayOfWeek: 4, startHour: 18, endHour: 19, activity: "Estudio", color: "bg-indigo-500" },
      // Friday
      { dayOfWeek: 5, startHour: 9, endHour: 17, activity: "Trabajo", color: "bg-primary" },
      { dayOfWeek: 5, startHour: 19, endHour: 22, activity: "Social", color: "bg-pink-500" },
      // Saturday
      { dayOfWeek: 6, startHour: 10, endHour: 14, activity: "Personal", color: "bg-green-500" },
      { dayOfWeek: 6, startHour: 15, endHour: 17, activity: "Hogar", color: "bg-orange-500" },
      { dayOfWeek: 6, startHour: 18, endHour: 22, activity: "Relax", color: "bg-accent" },
      // Sunday
      { dayOfWeek: 0, startHour: 10, endHour: 12, activity: "Relax", color: "bg-accent" },
      { dayOfWeek: 0, startHour: 14, endHour: 16, activity: "Preparar", color: "bg-blue-400" },
      { dayOfWeek: 0, startHour: 17, endHour: 21, activity: "Familia", color: "bg-pink-400" },
    ];

    sampleBlocks.forEach(block => {
      createRoutineMutation.mutate({
        ...block,
        weekOf: weekStart,
        completed: false,
      });
    });
  };

  // Group blocks by day
  const groupedBlocks = routineBlocks?.reduce((acc, block) => {
    if (!acc[block.dayOfWeek]) acc[block.dayOfWeek] = [];
    acc[block.dayOfWeek].push(block);
    return acc;
  }, {} as Record<number, RoutineBlock[]>) || {};

  // Sort blocks by start hour
  Object.keys(groupedBlocks).forEach(day => {
    groupedBlocks[Number(day)].sort((a, b) => a.startHour - b.startHour);
  });

  const totalBlocks = routineBlocks?.length || 0;
  const completedBlocks = routineBlocks?.filter(block => block.completed).length || 0;
  const adherenceRate = totalBlocks > 0 ? (completedBlocks / totalBlocks) * 100 : 0;

  return (
    <Card className="border border-gray-200">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-primary" />
            <span>Rutina Semanal</span>
          </div>
          <div className="text-sm text-gray-600">
            {format(weekStart, "'Semana del' dd/MM", { locale: es })}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {totalBlocks > 0 ? (
          <>
            {/* Adherence Rate */}
            <div className="bg-calm-blue rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-primary">Adherencia a la rutina</span>
                <span className="text-2xl font-bold text-primary">{Math.round(adherenceRate)}%</span>
              </div>
              <div className="text-sm text-gray-600">
                {completedBlocks} de {totalBlocks} actividades completadas
              </div>
            </div>

            {/* Weekly Schedule */}
            <div className="space-y-4">
              {[1, 2, 3, 4, 5, 6, 0].map((dayIndex) => {
                const dayBlocks = groupedBlocks[dayIndex] || [];
                const dayName = dayNames[dayIndex === 0 ? 6 : dayIndex - 1];
                
                return (
                  <div key={dayIndex}>
                    <h3 className="font-medium text-gray-900 mb-2">{dayName}</h3>
                    {dayBlocks.length > 0 ? (
                      <div className="space-y-2">
                        {dayBlocks.map((block) => (
                          <div
                            key={block.id}
                            className={`flex items-center justify-between p-3 rounded-lg ${
                              block.completed ? 'bg-success-light' : 'bg-gray-50'
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <div className={`w-4 h-4 rounded-full ${block.color}`} />
                              <div>
                                <div className="font-medium text-sm">{block.activity}</div>
                                <div className="text-xs text-gray-500">
                                  {block.startHour.toString().padStart(2, '0')}:00 - {block.endHour.toString().padStart(2, '0')}:00
                                </div>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleCompletion(block)}
                              className={`h-8 w-8 p-0 ${
                                block.completed ? 'text-secondary' : 'text-gray-400'
                              }`}
                            >
                              {block.completed ? (
                                <Check className="h-4 w-4" />
                              ) : (
                                <X className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-gray-500 text-sm">
                        Sin actividades programadas
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">No hay rutina configurada para esta semana</p>
            <Button
              onClick={createSampleRoutine}
              className="bg-primary text-white hover:bg-blue-600"
            >
              Crear rutina de ejemplo
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}