import express from "express";
import cors from "cors";
import { initSchema } from "./db.js";
import { seedIfEmpty } from "./seed.js";
import { jobsRouter } from "./routes/jobs.js";
import { candidatesRouter } from "./routes/candidates.js";

initSchema();
seedIfEmpty();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "hirematch-api" });
});

app.use("/api/jobs", jobsRouter);
app.use("/api/candidates", candidatesRouter);

const port = Number(process.env.PORT ?? 4000);

// Only listen when run directly (tests import the app helpers, not this file).
const server = app.listen(port, () => {
  console.log(`HireMatch API listening on http://localhost:${port}`);
});

export { app, server };
