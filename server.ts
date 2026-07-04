import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { router as apiRouter } from "./server/routes.js";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Standalone JSON & URL-encoded Parsers
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ limit: "10mb", extended: true }));

  // Request Logging
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
  });

  // Mount Full-Stack API Router
  app.use("/api", apiRouter);

  // Vite Integration Layer (Dev Server vs. Production Static Build)
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting development server with Vite middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting production static asset delivery...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Error Handling Middleware
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error("Unhandled Server Error:", err);
    res.status(err.status || 500).json({
      error: err.message || "An unexpected server error occurred",
    });
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🧠 Smart Interview Coach Agent running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Critical: Failed to boot Express backend server:", err);
});
