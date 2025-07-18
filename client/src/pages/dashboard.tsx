import { useState } from "react";
import HeaderNavigation from "@/components/header-navigation";
import CurrentFocusCard from "@/components/current-focus-card";
import EmotionalRegulationCard from "@/components/emotional-regulation-card";
import TaskBreakdownCard from "@/components/task-breakdown-card";
import EisenhowerMatrix from "@/components/eisenhower-matrix";
import VisualRoutineBoard from "@/components/visual-routine-board";
import TimeEstimationTracker from "@/components/time-estimation-tracker";
import CognitiveReframing from "@/components/cognitive-reframing";
import QuickActionBar from "@/components/quick-action-bar";

export default function Dashboard() {
  const [emergencyMode, setEmergencyMode] = useState(false);

  return (
    <div className={`min-h-screen bg-surface ${emergencyMode ? 'emergency-mode' : ''}`}>
      <HeaderNavigation 
        emergencyMode={emergencyMode} 
        setEmergencyMode={setEmergencyMode} 
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column - Current Focus & Emergency Tools */}
          <div className="lg:col-span-4 space-y-6">
            <CurrentFocusCard />
            <EmotionalRegulationCard emergencyMode={emergencyMode} />
          </div>
          
          {/* Center Column - Task Management */}
          <div className="lg:col-span-5 space-y-6">
            <TaskBreakdownCard />
            <EisenhowerMatrix />
          </div>
          
          {/* Right Column - Tracking & Analytics */}
          <div className="lg:col-span-3 space-y-6">
            <VisualRoutineBoard />
            <TimeEstimationTracker />
            <CognitiveReframing />
          </div>
        </div>
      </div>
      
      <QuickActionBar />
    </div>
  );
}
