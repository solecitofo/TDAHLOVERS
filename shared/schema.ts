import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  priority: text("priority").notNull(), // urgent-important, urgent-not-important, not-urgent-important, not-urgent-not-important
  status: text("status").notNull().default("pending"), // pending, in-progress, completed
  estimatedMinutes: integer("estimated_minutes"),
  actualMinutes: integer("actual_minutes"),
  steps: jsonb("steps").$type<TaskStep[]>().default([]),
  currentStepIndex: integer("current_step_index").default(0),
  emotionalState: text("emotional_state"), // emoji representation
  minimalViableTask: text("minimal_viable_task"),
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const moodEntries = pgTable("mood_entries", {
  id: serial("id").primaryKey(),
  mood: text("mood").notNull(), // very-sad, sad, neutral, happy, very-happy
  emotionalState: text("emotional_state"),
  triggers: jsonb("triggers").$type<string[]>().default([]),
  notes: text("notes"),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const pomodoroSessions = pgTable("pomodoro_sessions", {
  id: serial("id").primaryKey(),
  taskId: integer("task_id").references(() => tasks.id),
  duration: integer("duration").notNull().default(25), // minutes
  type: text("type").notNull(), // work, break, long-break
  completed: boolean("completed").default(false),
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const routineBlocks = pgTable("routine_blocks", {
  id: serial("id").primaryKey(),
  dayOfWeek: integer("day_of_week").notNull(), // 0-6 (Sunday-Saturday)
  startHour: integer("start_hour").notNull(),
  endHour: integer("end_hour").notNull(),
  activity: text("activity").notNull(),
  color: text("color").notNull(),
  completed: boolean("completed").default(false),
  weekOf: timestamp("week_of").notNull(),
});

export const cognitiveReframes = pgTable("cognitive_reframes", {
  id: serial("id").primaryKey(),
  negativeThought: text("negative_thought").notNull(),
  balancedThought: text("balanced_thought").notNull(),
  situation: text("situation"),
  emotionBefore: text("emotion_before"),
  emotionAfter: text("emotion_after"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const emergencyPlans = pgTable("emergency_plans", {
  id: serial("id").primaryKey(),
  trigger: text("trigger").notNull(),
  strategy: text("strategy").notNull(),
  isActive: boolean("is_active").default(true),
  effectiveness: integer("effectiveness"), // 1-5 rating
  createdAt: timestamp("created_at").defaultNow(),
});

// Zod schemas
export type TaskStep = {
  id: string;
  title: string;
  estimatedMinutes: number;
  completed: boolean;
  completedAt?: string;
};

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true,
  completedAt: true,
});

export const insertMoodEntrySchema = createInsertSchema(moodEntries).omit({
  id: true,
  timestamp: true,
});

export const insertPomodoroSessionSchema = createInsertSchema(pomodoroSessions).omit({
  id: true,
  startedAt: true,
  completedAt: true,
});

export const insertRoutineBlockSchema = createInsertSchema(routineBlocks).omit({
  id: true,
});

export const insertCognitiveReframeSchema = createInsertSchema(cognitiveReframes).omit({
  id: true,
  createdAt: true,
});

export const insertEmergencyPlanSchema = createInsertSchema(emergencyPlans).omit({
  id: true,
  createdAt: true,
});

// Inferred types
export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type MoodEntry = typeof moodEntries.$inferSelect;
export type InsertMoodEntry = z.infer<typeof insertMoodEntrySchema>;
export type PomodoroSession = typeof pomodoroSessions.$inferSelect;
export type InsertPomodoroSession = z.infer<typeof insertPomodoroSessionSchema>;
export type RoutineBlock = typeof routineBlocks.$inferSelect;
export type InsertRoutineBlock = z.infer<typeof insertRoutineBlockSchema>;
export type CognitiveReframe = typeof cognitiveReframes.$inferSelect;
export type InsertCognitiveReframe = z.infer<typeof insertCognitiveReframeSchema>;
export type EmergencyPlan = typeof emergencyPlans.$inferSelect;
export type InsertEmergencyPlan = z.infer<typeof insertEmergencyPlanSchema>;
