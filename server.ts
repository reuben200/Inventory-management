import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "10mb" }));

  // Initialize Gemini AI Client lazily/safely
  const getGenAI = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is missing.");
    }
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  };

  // Healthcheck
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Gemini AI Insights Endpoint
  app.post("/api/gemini/insights", async (req, res) => {
    try {
      const { inventory, orders, purchaseOrders, metrics } = req.body;
      const ai = getGenAI();

      const prompt = `You are an expert Inventory Management & Business Operations Analyst for StockSync Business OS.
Analyze the following real-time company operational data and provide structured actionable insights.

OPERATIONAL SUMMARY:
- Total Inventory Items: ${metrics?.totalItems || inventory?.length || 0}
- Total Inventory Valuation: $${metrics?.totalValuation || 0}
- Low Stock Items Count: ${metrics?.lowStockCount || 0}
- Total Revenue: $${metrics?.totalRevenue || 0}
- Total Orders Processed: ${metrics?.totalOrders || 0}
- Open Purchase Orders: ${purchaseOrders?.filter((po: any) => po.status === 'Pending' || po.status === 'Ordered').length || 0}

INVENTORY HIGHLIGHTS (Sample):
${JSON.stringify((inventory || []).slice(0, 15), null, 2)}

RECENT CUSTOMER ORDERS (Sample):
${JSON.stringify((orders || []).slice(0, 10), null, 2)}

Provide a structured JSON output with the exact schema:
{
  "healthScore": number (0-100),
  "executiveSummary": "Concise paragraph summarizing overall operational health and critical priorities",
  "topAlerts": [
    { "type": "critical" | "warning" | "opportunity", "title": "...", "description": "..." }
  ],
  "stockOptimizations": [
    { "sku": "...", "productName": "...", "suggestion": "...", "impact": "High" | "Medium" | "Low" }
  ],
  "demandForecast": "Analysis of current order velocity and items likely to experience stockouts soon",
  "actionableSteps": [
    "Step 1...", "Step 2...", "Step 3..."
  ]
}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.2,
        },
      });

      const text = response.text || "{}";
      const insights = JSON.parse(text);
      res.json({ success: true, insights });
    } catch (error: any) {
      console.error("Error generating AI insights:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Failed to generate AI business insights.",
      });
    }
  });

  // Gemini AI Copilot Assistant Endpoint
  app.post("/api/gemini/copilot", async (req, res) => {
    try {
      const { query, inventory, orders, metrics, chatHistory } = req.body;
      const ai = getGenAI();

      const systemInstruction = `You are StockSync Copilot, an intelligent AI Assistant embedded inside the business inventory & order management operating system.
You have real-time access to the company's inventory database, order status, automated reordering triggers, and sales performance metrics.
Be concise, practical, numerical, professional, and friendly.

CURRENT BUSINESS CONTEXT:
- Total Inventory Items: ${metrics?.totalItems || 0}
- Total Stock Valuation: $${metrics?.totalValuation || 0}
- Low Stock Items Count: ${metrics?.lowStockCount || 0}
- Total Sales Revenue: $${metrics?.totalRevenue || 0}
- Total Customer Orders: ${metrics?.totalOrders || 0}

Key Products Sample:
${JSON.stringify((inventory || []).slice(0, 10).map((i: any) => ({ name: i.name, sku: i.sku, stock: i.stockQuantity, reorderPoint: i.reorderPoint, status: i.status, cost: i.costPrice, price: i.sellingPrice })), null, 2)}

Provide clear answers, formatted with bullet points, short key figures, and direct operational recommendations.`;

      const contents = [];
      if (Array.isArray(chatHistory)) {
        for (const msg of chatHistory) {
          contents.push({
            role: msg.role === "user" ? "user" : "model",
            parts: [{ text: msg.content }],
          });
        }
      }
      contents.push({
        role: "user",
        parts: [{ text: query }],
      });

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: contents,
        config: {
          systemInstruction,
          temperature: 0.4,
        },
      });

      res.json({ success: true, answer: response.text });
    } catch (error: any) {
      console.error("Error in Copilot query:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Failed to query Copilot.",
      });
    }
  });

  // Vite middleware in dev / static serve in prod
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`StockSync Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
