import { Timer, CheckCircle, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useTasks } from "@/hooks/use-tasks";

export default function TimeEstimationTracker() {
  const { tasks } = useTasks();
  
  const completedTasks = tasks?.filter(task => 
    task.status === "completed" && 
    task.estimatedMinutes && 
    task.actualMinutes
  ) || [];

  const calculateAccuracy = (estimated: number, actual: number) => {
    const difference = Math.abs(estimated - actual);
    const accuracy = Math.max(0, 100 - (difference / estimated) * 100);
    return Math.round(accuracy);
  };

  const averageAccuracy = completedTasks.length > 0
    ? completedTasks.reduce((sum, task) => 
        sum + calculateAccuracy(task.estimatedMinutes!, task.actualMinutes!), 0
      ) / completedTasks.length
    : 0;

  return (
    <Card className="border border-gray-200">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Timer className="h-5 w-5 text-primary" />
          <span>Estimación vs Realidad</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {completedTasks.slice(0, 3).map((task) => {
          const overTime = task.actualMinutes! > task.estimatedMinutes!;
          const percentDifference = Math.round(
            ((task.actualMinutes! - task.estimatedMinutes!) / task.estimatedMinutes!) * 100
          );
          const accuracy = calculateAccuracy(task.estimatedMinutes!, task.actualMinutes!);

          return (
            <div key={task.id} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-700 truncate flex-1 mr-2">
                  {task.title}
                </span>
                <span className="text-xs text-gray-500">Completado</span>
              </div>
              
              <div className="flex items-center space-x-2 mb-2">
                <div className="flex items-center space-x-1">
                  <span className="text-xs text-gray-500">Estimado:</span>
                  <span className="text-xs font-medium text-gray-700">
                    {task.estimatedMinutes} min
                  </span>
                </div>
                <span className="text-xs text-gray-400">vs</span>
                <div className="flex items-center space-x-1">
                  <span className="text-xs text-gray-500">Real:</span>
                  <span className={`text-xs font-medium ${
                    overTime ? 'text-destructive' : 'text-secondary'
                  }`}>
                    {task.actualMinutes} min
                  </span>
                </div>
              </div>
              
              <div className={`text-xs ${overTime ? 'text-destructive' : 'text-secondary'}`}>
                {overTime ? (
                  <div className="flex items-center">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    {Math.abs(percentDifference)}% más tiempo del estimado
                  </div>
                ) : (
                  <div className="flex items-center">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    ¡Buen cálculo! {accuracy}% de precisión
                  </div>
                )}
              </div>
            </div>
          );
        })}
        
        {completedTasks.length === 0 && (
          <div className="text-center py-4">
            <p className="text-sm text-gray-500">
              Completa tareas para ver tu precisión temporal
            </p>
          </div>
        )}
        
        {completedTasks.length > 0 && (
          <div className="pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-600">Precisión promedio</span>
              <span className={`font-medium ${
                averageAccuracy >= 80 ? 'text-secondary' : 
                averageAccuracy >= 60 ? 'text-accent' : 'text-destructive'
              }`}>
                {Math.round(averageAccuracy)}%
              </span>
            </div>
            <Progress value={averageAccuracy} className="h-2" />
            <p className="text-xs text-gray-500 mt-1">
              {averageAccuracy >= 80 ? "¡Excelente estimación!" : 
               averageAccuracy >= 60 ? "Mejorando gradualmente" : 
               "Necesita más práctica"}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
