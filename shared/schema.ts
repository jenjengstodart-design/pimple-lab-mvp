import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const experiments = pgTable("experiments", {
  id: serial("id").primaryKey(),
  age: integer("age").notNull(),
  stressLevel: integer("stress_level").notNull(),
  makeup: boolean("makeup").notNull(),
  sportFrequency: text("sport_frequency").notNull(), 
  menstrualCyclePhase: text("menstrual_cycle_phase"),
  initialImageUrl: text("initial_image_url").notNull(),
  
  acneType: text("acne_type"),
  confidence: integer("confidence"),
  visualFeatures: json("visual_features").$type<string[]>(),
  contextFactors: json("context_factors").$type<string[]>(),
  hypothesis: text("hypothesis"),

  routineDescription: text("routine_description"),
  durationDays: integer("duration_days"),

  followUpImageUrl: text("follow_up_image_url"),
  outcome: text("outcome"),

  createdAt: timestamp("created_at").defaultNow(),
});

export const dailyCheckins = pgTable("daily_checkins", {
  id: serial("id").primaryKey(),
  experimentId: integer("experiment_id").notNull(),
  dayNumber: integer("day_number").notNull(),
  adherence: integer("adherence").notNull(), 
  stressLevel: integer("stress_level").notNull(),
  makeup: boolean("makeup").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const experimentsRelations = relations(experiments, ({ many }) => ({
  checkins: many(dailyCheckins),
}));

export const dailyCheckinsRelations = relations(dailyCheckins, ({ one }) => ({
  experiment: one(experiments, {
    fields: [dailyCheckins.experimentId],
    references: [experiments.id],
  }),
}));

export const insertExperimentSchema = createInsertSchema(experiments).omit({ id: true, createdAt: true });
export const insertDailyCheckinSchema = createInsertSchema(dailyCheckins).omit({ id: true, createdAt: true });

export type Experiment = typeof experiments.$inferSelect;
export type InsertExperiment = z.infer<typeof insertExperimentSchema>;
export type DailyCheckin = typeof dailyCheckins.$inferSelect;
export type InsertDailyCheckin = z.infer<typeof insertDailyCheckinSchema>;

export type Product = {
  id: string;
  name: string;
  category: string;
  price: string;
  link: string;
};

export type AnalysisResponse = {
  acne_type: string;
  confidence: number;
  visual_features: string[];
  context_factors: string[];
  experiment_hypothesis: string;
};
