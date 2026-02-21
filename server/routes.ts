import type { Express } from "express";
import { type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import fs from "fs";
import path from "path";
import express from "express";
import { randomUUID } from "crypto";

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Helper to save base64 image and return URL
function saveBase64Image(base64Data: string): string {
  const matches = base64Data.match(/^data:image\/([A-Za-z-+\/]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) throw new Error('Invalid base64 string');

  let extension = matches[1];
  if (extension === 'jpeg') extension = 'jpg';

  const imageData = Buffer.from(matches[2], 'base64');
  const filename = `${randomUUID()}.${extension}`;
  const filepath = path.join(uploadsDir, filename);

  fs.writeFileSync(filepath, imageData);
  return `/uploads/${filename}`;
}

const SUPERDRUG_PRODUCTS = [
  { id: "1", name: "CeraVe SA Smoothing Cleanser", category: "salicylic acid", price: "£14.00", link: "https://www.superdrug.com" },
  { id: "2", name: "The Ordinary Salicylic Acid 2% Solution", category: "salicylic acid", price: "£6.30", link: "https://www.superdrug.com" },
  { id: "3", name: "Me+ Salicylic Acid & Ceramide Cleanser", category: "salicylic acid", price: "£7.99", link: "https://www.superdrug.com" },
  { id: "4", name: "Acnecide Face Gel Spot Treatment 5%", category: "benzoyl peroxide", price: "£11.99", link: "https://www.superdrug.com" },
  { id: "5", name: "Acnecide Face Wash 5%", category: "benzoyl peroxide", price: "£11.99", link: "https://www.superdrug.com" },
  { id: "6", name: "Cetaphil Gentle Skin Cleanser", category: "gentle cleanser", price: "£10.00", link: "https://www.superdrug.com" },
  { id: "7", name: "Simple Water Boost Micellar Gel Wash", category: "gentle cleanser", price: "£5.99", link: "https://www.superdrug.com" },
  { id: "8", name: "Neutrogena Clear & Defend Oil-Free Moisturiser", category: "oil-free moisturiser", price: "£7.50", link: "https://www.superdrug.com" },
  { id: "9", name: "e.l.f. Skin Superhydrate Moisturiser", category: "oil-free moisturiser", price: "£12.00", link: "https://www.superdrug.com" },
  { id: "10", name: "Nizoral Anti-Dandruff Shampoo (for fungal acne)", category: "antifungal-friendly", price: "£6.50", link: "https://www.superdrug.com" },
  { id: "11", name: "Starface Hydro-Stars", category: "spot treatment", price: "£11.99", link: "https://www.superdrug.com" },
  { id: "12", name: "Byoma Creamy Jelly Cleanser", category: "gentle cleanser", price: "£9.99", link: "https://www.superdrug.com" },
];

async function analyze_with_medgemma(imageUrl: string, context: any): Promise<{
  acne_type: string;
  confidence: number;
  visual_features: string[];
  context_factors: string[];
  experiment_hypothesis: string;
}> {
  // Mock mode: return realistic test data when endpoint isn't configured
  if (!process.env.HF_TOKEN || !process.env.MEDGEMMA_ENDPOINT) {
    console.log("[MedGemma] Running in MOCK mode (HF_TOKEN or MEDGEMMA_ENDPOINT not set)");
    return {
      acne_type: "Inflammatory",
      confidence: 72,
      visual_features: ["Papules on forehead", "Mild redness around nose", "Small pustules on chin"],
      context_factors: [
        `Age: ${context.age ?? "unknown"}`,
        `Stress level: ${context.stressLevel ?? "unknown"}/5`,
        `Sport frequency: ${context.sportFrequency ?? "unknown"}`
      ],
      experiment_hypothesis: "A consistent gentle cleansing routine with salicylic acid may reduce inflammation over 7-14 days."
    };
  }

  // Read image from disk and encode as base64
  const imagePath = path.join(process.cwd(), imageUrl);
  if (!fs.existsSync(imagePath)) {
    throw new Error(`Image file not found at ${imagePath}`);
  }
  const imageBuffer = fs.readFileSync(imagePath);
  const base64Image = imageBuffer.toString("base64");

  const prompt = `Analyze this skin image for acne. Respond ONLY with valid JSON (no markdown, no code blocks) with exactly these keys:
{
  "acne_type": "<string: e.g. Hormonal, Cystic, Comedonal, Fungal, Inflammatory>",
  "confidence": <number 0-100>,
  "visual_features": ["<observation>"],
  "context_factors": ["<factor>"],
  "experiment_hypothesis": "<string>"
}`;

  const inputs = `![](data:image/jpeg;base64,${base64Image})\n${prompt}`;

  let response: Response;
  try {
    response = await fetch(process.env.MEDGEMMA_ENDPOINT, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.HF_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        inputs,
        parameters: { max_new_tokens: 512 }
      })
    });
  } catch (networkErr: any) {
    throw new Error(`Failed to connect to MedGemma endpoint. Check that MEDGEMMA_ENDPOINT is the inference URL (not the dashboard URL). Details: ${networkErr.message}`);
  }

  if (!response.ok) {
    const errorText = await response.text();
    if (response.status === 401 || response.status === 403) {
      throw new Error(`Authentication failed (${response.status}). Check your HF_TOKEN is valid.`);
    }
    if (response.status === 404) {
      throw new Error(`Endpoint not found (404). MEDGEMMA_ENDPOINT should be the inference URL (e.g. https://xxxxx.endpoints.huggingface.cloud), not the dashboard URL.`);
    }
    throw new Error(`HF API error ${response.status}: ${errorText}`);
  }

  const raw = await response.json();
  console.log("[MedGemma] Raw response:", JSON.stringify(raw, null, 2));

  // HF inference toolkit returns [{ generated_text: "..." }]
  const content: string = Array.isArray(raw)
    ? (raw[0]?.generated_text ?? "")
    : (raw?.generated_text ?? "");

  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error(`No JSON found in model output: ${content}`);

  const parsed = JSON.parse(jsonMatch[0]);

  return {
    acne_type: String(parsed.acne_type ?? "Unknown"),
    confidence: Number(parsed.confidence ?? 50),
    visual_features: Array.isArray(parsed.visual_features) ? parsed.visual_features.map(String) : [],
    context_factors: Array.isArray(parsed.context_factors) ? parsed.context_factors.map(String) : [],
    experiment_hypothesis: String(parsed.experiment_hypothesis ?? "Maintain a consistent skincare routine.")
  };
}

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {
  app.use('/uploads', express.static(uploadsDir));

  app.post(api.experiments.create.path, async (req, res) => {
    try {
      const input = api.experiments.create.input.parse(req.body);
      const imageUrl = saveBase64Image(input.imageBase64);
      const experiment = await storage.createExperiment({
        age: input.age, stressLevel: input.stressLevel, makeup: input.makeup,
        sportFrequency: input.sportFrequency, menstrualCyclePhase: input.menstrualCyclePhase,
        initialImageUrl: imageUrl,
      });
      res.status(201).json(experiment);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get(api.experiments.get.path, async (req, res) => {
    const experiment = await storage.getExperiment(Number(req.params.id));
    if (!experiment) return res.status(404).json({ message: "Experiment not found" });
    res.json(experiment);
  });

  app.patch(api.experiments.update.path, async (req, res) => {
    try {
      const input = api.experiments.update.input.parse(req.body);
      const experiment = await storage.updateExperiment(Number(req.params.id), input);
      if (!experiment) return res.status(404).json({ message: "Experiment not found" });
      res.json(experiment);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post(api.experiments.analyze.path, async (req, res) => {
    try {
      const experiment = await storage.getExperiment(Number(req.params.id));
      if (!experiment) return res.status(404).json({ message: "Experiment not found" });

      const analysis = await analyze_with_medgemma(experiment.initialImageUrl, {
        age: experiment.age, stressLevel: experiment.stressLevel, sportFrequency: experiment.sportFrequency
      });

      await storage.updateExperiment(experiment.id, {
        acneType: analysis.acne_type, confidence: analysis.confidence,
        visualFeatures: analysis.visual_features, contextFactors: analysis.context_factors,
        hypothesis: analysis.experiment_hypothesis
      });

      res.json(analysis);
    } catch (err: any) {
      console.error("[MedGemma] Analysis error:", err.message);
      res.status(500).json({ message: `Analysis failed: ${err.message}` });
    }
  });

  app.post(api.experiments.followUp.path, async (req, res) => {
    try {
      const input = api.experiments.followUp.input.parse(req.body);
      const imageUrl = saveBase64Image(input.imageBase64);
      const experiment = await storage.updateExperiment(Number(req.params.id), { followUpImageUrl: imageUrl, outcome: input.outcome });
      if (!experiment) return res.status(404).json({ message: "Experiment not found" });
      res.json(experiment);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get(api.experiments.getCheckins.path, async (req, res) => {
    const checkins = await storage.getCheckins(Number(req.params.id));
    res.json(checkins);
  });

  app.post(api.experiments.addCheckin.path, async (req, res) => {
    try {
      const input = api.experiments.addCheckin.input.parse(req.body);
      const checkin = await storage.createCheckin({ ...input, experimentId: Number(req.params.id) });
      res.status(201).json(checkin);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get(api.products.list.path, async (req, res) => {
    const type = req.query.acneType as string;
    let filtered = SUPERDRUG_PRODUCTS;
    if (type && type.toLowerCase().includes("hormonal")) {
      filtered = SUPERDRUG_PRODUCTS.filter(p => p.category.includes("salicylic") || p.category.includes("gentle"));
    }
    res.json(filtered.slice(0, 3));
  });

  return httpServer;
}
