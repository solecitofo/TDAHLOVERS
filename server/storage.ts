import {
  tasks,
  moodEntries,
  pomodoroSessions,
  routineBlocks,
  cognitiveReframes,
  emergencyPlans,
  type Task,
  type InsertTask,
  type MoodEntry,
  type InsertMoodEntry,
  type PomodoroSession,
  type InsertPomodoroSession,
  type RoutineBlock,
  type InsertRoutineBlock,
  type CognitiveReframe,
  type InsertCognitiveReframe,
  type EmergencyPlan,
  type InsertEmergencyPlan,
} from "@shared/schema";

export interface IStorage {
  // Tasks
  getTasks(): Promise<Task[]>;
  getTask(id: number): Promise<Task | undefined>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, updates: Partial<Task>): Promise<Task>;
  deleteTask(id: number): Promise<void>;
  
  // Mood entries
  getMoodEntries(limit?: number): Promise<MoodEntry[]>;
  createMoodEntry(entry: InsertMoodEntry): Promise<MoodEntry>;
  
  // Pomodoro sessions
  getPomodoroSessions(taskId?: number): Promise<PomodoroSession[]>;
  createPomodoroSession(session: InsertPomodoroSession): Promise<PomodoroSession>;
  updatePomodoroSession(id: number, updates: Partial<PomodoroSession>): Promise<PomodoroSession>;
  
  // Routine blocks
  getRoutineBlocks(weekOf: Date): Promise<RoutineBlock[]>;
  createRoutineBlock(block: InsertRoutineBlock): Promise<RoutineBlock>;
  updateRoutineBlock(id: number, updates: Partial<RoutineBlock>): Promise<RoutineBlock>;
  
  // Cognitive reframes
  getCognitiveReframes(limit?: number): Promise<CognitiveReframe[]>;
  createCognitiveReframe(reframe: InsertCognitiveReframe): Promise<CognitiveReframe>;
  
  // Emergency plans
  getEmergencyPlans(): Promise<EmergencyPlan[]>;
  createEmergencyPlan(plan: InsertEmergencyPlan): Promise<EmergencyPlan>;
  updateEmergencyPlan(id: number, updates: Partial<EmergencyPlan>): Promise<EmergencyPlan>;
}

export class MemStorage implements IStorage {
  private tasks: Map<number, Task> = new Map();
  private moodEntries: Map<number, MoodEntry> = new Map();
  private pomodoroSessions: Map<number, PomodoroSession> = new Map();
  private routineBlocks: Map<number, RoutineBlock> = new Map();
  private cognitiveReframes: Map<number, CognitiveReframe> = new Map();
  private emergencyPlans: Map<number, EmergencyPlan> = new Map();
  
  private currentTaskId = 1;
  private currentMoodId = 1;
  private currentPomodoroId = 1;
  private currentRoutineId = 1;
  private currentReframeId = 1;
  private currentPlanId = 1;

  constructor() {
    // Initialize with some default emergency plans
    this.emergencyPlans.set(1, {
      id: 1,
      trigger: "Feeling overwhelmed",
      strategy: "Take 3 deep breaths, write down one small task, start with 5-minute rule",
      isActive: true,
      effectiveness: null,
      createdAt: new Date(),
    });
    this.emergencyPlans.set(2, {
      id: 2,
      trigger: "Procrastination spiral",
      strategy: "Use traffic light technique: STOP → Think about minimal viable task → ACT on smallest step",
      isActive: true,
      effectiveness: null,
      createdAt: new Date(),
    });
    this.currentPlanId = 3;
  }

  // Tasks
  async getTasks(): Promise<Task[]> {
    return Array.from(this.tasks.values()).sort((a, b) => 
      new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    );
  }

  async getTask(id: number): Promise<Task | undefined> {
    return this.tasks.get(id);
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const id = this.currentTaskId++;
    const task: Task = {
      ...insertTask,
      id,
      createdAt: new Date(),
      completedAt: null,
    };
    this.tasks.set(id, task);
    return task;
  }

  async updateTask(id: number, updates: Partial<Task>): Promise<Task> {
    const task = this.tasks.get(id);
    if (!task) throw new Error("Task not found");
    
    const updatedTask = { ...task, ...updates };
    if (updates.status === "completed" && !task.completedAt) {
      updatedTask.completedAt = new Date();
    }
    
    this.tasks.set(id, updatedTask);
    return updatedTask;
  }

  async deleteTask(id: number): Promise<void> {
    this.tasks.delete(id);
  }

  // Mood entries
  async getMoodEntries(limit = 10): Promise<MoodEntry[]> {
    return Array.from(this.moodEntries.values())
      .sort((a, b) => new Date(b.timestamp!).getTime() - new Date(a.timestamp!).getTime())
      .slice(0, limit);
  }

  async createMoodEntry(insertEntry: InsertMoodEntry): Promise<MoodEntry> {
    const id = this.currentMoodId++;
    const entry: MoodEntry = {
      ...insertEntry,
      id,
      timestamp: new Date(),
    };
    this.moodEntries.set(id, entry);
    return entry;
  }

  // Pomodoro sessions
  async getPomodoroSessions(taskId?: number): Promise<PomodoroSession[]> {
    const sessions = Array.from(this.pomodoroSessions.values());
    if (taskId) {
      return sessions.filter(s => s.taskId === taskId);
    }
    return sessions.sort((a, b) => new Date(b.startedAt!).getTime() - new Date(a.startedAt!).getTime());
  }

  async createPomodoroSession(insertSession: InsertPomodoroSession): Promise<PomodoroSession> {
    const id = this.currentPomodoroId++;
    const session: PomodoroSession = {
      ...insertSession,
      id,
      startedAt: new Date(),
      completedAt: null,
    };
    this.pomodoroSessions.set(id, session);
    return session;
  }

  async updatePomodoroSession(id: number, updates: Partial<PomodoroSession>): Promise<PomodoroSession> {
    const session = this.pomodoroSessions.get(id);
    if (!session) throw new Error("Pomodoro session not found");
    
    const updatedSession = { ...session, ...updates };
    if (updates.completed && !session.completedAt) {
      updatedSession.completedAt = new Date();
    }
    
    this.pomodoroSessions.set(id, updatedSession);
    return updatedSession;
  }

  // Routine blocks
  async getRoutineBlocks(weekOf: Date): Promise<RoutineBlock[]> {
    return Array.from(this.routineBlocks.values())
      .filter(block => {
        const blockWeek = new Date(block.weekOf);
        const startOfWeek = new Date(weekOf);
        startOfWeek.setHours(0, 0, 0, 0);
        return blockWeek.getTime() === startOfWeek.getTime();
      })
      .sort((a, b) => a.dayOfWeek - b.dayOfWeek || a.startHour - b.startHour);
  }

  async createRoutineBlock(insertBlock: InsertRoutineBlock): Promise<RoutineBlock> {
    const id = this.currentRoutineId++;
    const block: RoutineBlock = {
      ...insertBlock,
      id,
    };
    this.routineBlocks.set(id, block);
    return block;
  }

  async updateRoutineBlock(id: number, updates: Partial<RoutineBlock>): Promise<RoutineBlock> {
    const block = this.routineBlocks.get(id);
    if (!block) throw new Error("Routine block not found");
    
    const updatedBlock = { ...block, ...updates };
    this.routineBlocks.set(id, updatedBlock);
    return updatedBlock;
  }

  // Cognitive reframes
  async getCognitiveReframes(limit = 10): Promise<CognitiveReframe[]> {
    return Array.from(this.cognitiveReframes.values())
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())
      .slice(0, limit);
  }

  async createCognitiveReframe(insertReframe: InsertCognitiveReframe): Promise<CognitiveReframe> {
    const id = this.currentReframeId++;
    const reframe: CognitiveReframe = {
      ...insertReframe,
      id,
      createdAt: new Date(),
    };
    this.cognitiveReframes.set(id, reframe);
    return reframe;
  }

  // Emergency plans
  async getEmergencyPlans(): Promise<EmergencyPlan[]> {
    return Array.from(this.emergencyPlans.values())
      .filter(plan => plan.isActive)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }

  async createEmergencyPlan(insertPlan: InsertEmergencyPlan): Promise<EmergencyPlan> {
    const id = this.currentPlanId++;
    const plan: EmergencyPlan = {
      ...insertPlan,
      id,
      createdAt: new Date(),
    };
    this.emergencyPlans.set(id, plan);
    return plan;
  }

  async updateEmergencyPlan(id: number, updates: Partial<EmergencyPlan>): Promise<EmergencyPlan> {
    const plan = this.emergencyPlans.get(id);
    if (!plan) throw new Error("Emergency plan not found");
    
    const updatedPlan = { ...plan, ...updates };
    this.emergencyPlans.set(id, updatedPlan);
    return updatedPlan;
  }
}

export const storage = new MemStorage();
