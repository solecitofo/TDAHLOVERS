import { useState, useEffect } from "react";
import { Brain, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderNavigationProps {
  emergencyMode: boolean;
  setEmergencyMode: (mode: boolean) => void;
}

export default function HeaderNavigation({ emergencyMode, setEmergencyMode }: HeaderNavigationProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Brain className="h-8 w-8 text-primary" />
              <h1 className="text-xl font-semibold text-gray-900">ADHD Life Manager</h1>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button
              variant={emergencyMode ? "destructive" : "outline"}
              size="sm"
              onClick={() => setEmergencyMode(!emergencyMode)}
              className={`flex items-center space-x-2 ${emergencyMode ? 'bg-error-light text-destructive border-destructive' : 'bg-error-light text-destructive hover:bg-red-100'}`}
            >
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm font-medium">Modo Emergencia</span>
            </Button>
            
            <div className="bg-calm-blue px-4 py-2 rounded-lg">
              <div className="text-sm font-medium text-primary">{formatTime(currentTime)}</div>
              <div className="text-xs text-gray-600">{formatDate(currentTime)}</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
