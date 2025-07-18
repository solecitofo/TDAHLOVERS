import { Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const weekDays = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

const routineData = [
  {
    day: "Lun",
    blocks: [
      { activity: "Trabajo", color: "bg-primary", duration: "flex-1" },
      { activity: "Gym", color: "bg-secondary", duration: "w-16" },
      { activity: "Descanso", color: "bg-accent", duration: "w-20" },
    ],
  },
  {
    day: "Mar",
    blocks: [
      { activity: "Trabajo", color: "bg-primary", duration: "flex-1" },
      { activity: "Terapia", color: "bg-purple-500", duration: "w-24" },
      { activity: "Relax", color: "bg-accent", duration: "w-16" },
    ],
  },
  {
    day: "Mié",
    blocks: [
      { activity: "Trabajo", color: "bg-primary", duration: "flex-1" },
      { activity: "Gym", color: "bg-secondary", duration: "w-16" },
      { activity: "Social", color: "bg-pink-500", duration: "w-20" },
    ],
  },
  {
    day: "Jue",
    blocks: [
      { activity: "Trabajo", color: "bg-primary", duration: "flex-1" },
      { activity: "Estudio", color: "bg-indigo-500", duration: "w-20" },
      { activity: "Descanso", color: "bg-accent", duration: "w-16" },
    ],
  },
  {
    day: "Vie",
    blocks: [
      { activity: "Trabajo", color: "bg-primary", duration: "flex-1" },
      { activity: "Social", color: "bg-pink-500", duration: "w-24" },
    ],
  },
  {
    day: "Sáb",
    blocks: [
      { activity: "Personal", color: "bg-green-500", duration: "w-32" },
      { activity: "Hogar", color: "bg-orange-500", duration: "w-20" },
      { activity: "Relax", color: "bg-accent", duration: "flex-1" },
    ],
  },
  {
    day: "Dom",
    blocks: [
      { activity: "Relax", color: "bg-accent", duration: "w-24" },
      { activity: "Preparar", color: "bg-blue-400", duration: "w-20" },
      { activity: "Descanso", color: "bg-gray-400", duration: "flex-1" },
    ],
  },
];

export default function VisualRoutineBoard() {
  const adherence = 78; // This would come from actual completion data

  return (
    <Card className="border border-gray-200">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Calendar className="h-5 w-5 text-primary" />
          <span>Rutina Semanal</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          {routineData.map((dayData) => (
            <div key={dayData.day} className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 w-16">
                {dayData.day}
              </span>
              <div className="flex space-x-1 flex-1">
                {dayData.blocks.map((block, index) => (
                  <div
                    key={index}
                    className={`h-6 ${block.color} rounded ${block.duration} flex items-center justify-center group relative`}
                  >
                    <span className="text-xs text-white font-medium truncate px-1">
                      {block.activity}
                    </span>
                    {/* Tooltip */}
                    <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {block.activity}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        <div className="pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-600">Adherencia esta semana</span>
            <span className="font-medium text-secondary">{adherence}%</span>
          </div>
          <Progress value={adherence} className="h-2" />
          <p className="text-xs text-gray-500 mt-1">
            {adherence >= 80 ? "¡Excelente!" : adherence >= 60 ? "Bien" : "Necesita mejorar"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
