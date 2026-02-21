import { db } from "./db";
import {
  experiments,
  dailyCheckins,
  type Experiment,
  type InsertExperiment,
  type DailyCheckin,
  type InsertDailyCheckin
} from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  getExperiment(id: number): Promise<Experiment | undefined>;
  createExperiment(experiment: InsertExperiment): Promise<Experiment>;
  updateExperiment(id: number, updates: Partial<Experiment>): Promise<Experiment>;
  
  getCheckins(experimentId: number): Promise<DailyCheckin[]>;
  createCheckin(checkin: InsertDailyCheckin): Promise<DailyCheckin>;
}

export class DatabaseStorage implements IStorage {
  async getExperiment(id: number): Promise<Experiment | undefined> {
    const [experiment] = await db.select().from(experiments).where(eq(experiments.id, id));
    return experiment;
  }

  async createExperiment(insertExperiment: InsertExperiment): Promise<Experiment> {
    const [experiment] = await db.insert(experiments).values(insertExperiment).returning();
    return experiment;
  }

  async updateExperiment(id: number, updates: Partial<Experiment>): Promise<Experiment> {
    const [updated] = await db.update(experiments)
      .set(updates)
      .where(eq(experiments.id, id))
      .returning();
    return updated;
  }

  async getCheckins(experimentId: number): Promise<DailyCheckin[]> {
    return await db.select().from(dailyCheckins).where(eq(dailyCheckins.experimentId, experimentId));
  }

  async createCheckin(insertCheckin: InsertDailyCheckin): Promise<DailyCheckin> {
    const [checkin] = await db.insert(dailyCheckins).values(insertCheckin).returning();
    return checkin;
  }
}

export const storage = new DatabaseStorage();
