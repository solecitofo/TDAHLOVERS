import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  insertTaskSchema,
  insertMoodEntrySchema,
  insertPomodoroSessionSchema,
  insertRoutineBlockSchema,
  insertCognitiveReframeSchema,
  insertEmergencyPlanSchema,
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Tasks routes
  app.get("/api/tasks", async (req, res) => {
    try {
      const tasks = await storage.getTasks();
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });

  app.get("/api/tasks/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const task = await storage.getTask(id);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      res.json(task);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch task" });
    }
  });

  app.post("/api/tasks", async (req, res) => {
    try {
      const validatedData = insertTaskSchema.parse(req.body);
      const task = await storage.createTask(validatedData);
      res.status(201).json(task);
    } catch (error) {
      res.status(400).json({ message: "Invalid task data" });
    }
  });

  app.patch("/api/tasks/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const task = await storage.updateTask(id, req.body);
      res.json(task);
    } catch (error) {
      res.status(500).json({ message: "Failed to update task" });
    }
  });

  app.delete("/api/tasks/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteTask(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete task" });
    }
  });

  // Mood entries routes
  app.get("/api/mood-entries", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const entries = await storage.getMoodEntries(limit);
      res.json(entries);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch mood entries" });
    }
  });

  app.post("/api/mood-entries", async (req, res) => {
    try {
      const validatedData = insertMoodEntrySchema.parse(req.body);
      const entry = await storage.createMoodEntry(validatedData);
      res.status(201).json(entry);
    } catch (error) {
      res.status(400).json({ message: "Invalid mood entry data" });
    }
  });

  // Pomodoro sessions routes
  app.get("/api/pomodoro-sessions", async (req, res) => {
    try {
      const taskId = req.query.taskId ? parseInt(req.query.taskId as string) : undefined;
      const sessions = await storage.getPomodoroSessions(taskId);
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch pomodoro sessions" });
    }
  });

  app.post("/api/pomodoro-sessions", async (req, res) => {
    try {
      const validatedData = insertPomodoroSessionSchema.parse(req.body);
      const session = await storage.createPomodoroSession(validatedData);
      res.status(201).json(session);
    } catch (error) {
      res.status(400).json({ message: "Invalid pomodoro session data" });
    }
  });

  app.patch("/api/pomodoro-sessions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const session = await storage.updatePomodoroSession(id, req.body);
      res.json(session);
    } catch (error) {
      res.status(500).json({ message: "Failed to update pomodoro session" });
    }
  });

  // Routine blocks routes
  app.get("/api/routine-blocks", async (req, res) => {
    try {
      const weekOf = req.query.weekOf ? new Date(req.query.weekOf as string) : new Date();
      const blocks = await storage.getRoutineBlocks(weekOf);
      res.json(blocks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch routine blocks" });
    }
  });

  app.post("/api/routine-blocks", async (req, res) => {
    try {
      const validatedData = insertRoutineBlockSchema.parse(req.body);
      const block = await storage.createRoutineBlock(validatedData);
      res.status(201).json(block);
    } catch (error) {
      res.status(400).json({ message: "Invalid routine block data" });
    }
  });

  app.patch("/api/routine-blocks/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const block = await storage.updateRoutineBlock(id, req.body);
      res.json(block);
    } catch (error) {
      res.status(500).json({ message: "Failed to update routine block" });
    }
  });

  // Cognitive reframes routes
  app.get("/api/cognitive-reframes", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const reframes = await storage.getCognitiveReframes(limit);
      res.json(reframes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch cognitive reframes" });
    }
  });

  app.post("/api/cognitive-reframes", async (req, res) => {
    try {
      const validatedData = insertCognitiveReframeSchema.parse(req.body);
      const reframe = await storage.createCognitiveReframe(validatedData);
      res.status(201).json(reframe);
    } catch (error) {
      res.status(400).json({ message: "Invalid cognitive reframe data" });
    }
  });

  // Emergency plans routes
  app.get("/api/emergency-plans", async (req, res) => {
    try {
      const plans = await storage.getEmergencyPlans();
      res.json(plans);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch emergency plans" });
    }
  });

  app.post("/api/emergency-plans", async (req, res) => {
    try {
      const validatedData = insertEmergencyPlanSchema.parse(req.body);
      const plan = await storage.createEmergencyPlan(validatedData);
      res.status(201).json(plan);
    } catch (error) {
      res.status(400).json({ message: "Invalid emergency plan data" });
    }
  });

  app.patch("/api/emergency-plans/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const plan = await storage.updateEmergencyPlan(id, req.body);
      res.json(plan);
    } catch (error) {
      res.status(500).json({ message: "Failed to update emergency plan" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
