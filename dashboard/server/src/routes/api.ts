import { Router, Request, Response } from "express";
import type { DataSource } from "../services/dataSource";
import { fileDataSource } from "../services/logReader";

const router = Router();

// Switch data source here when DB is ready:
//   import { dbDataSource } from "../services/dbReader";
//   const ds: DataSource = dbDataSource;
const ds: DataSource = fileDataSource;

router.get("/runs/latest", (_req: Request, res: Response) => {
  const run = ds.getLatestRun();
  if (!run) {
    res.status(404).json({ error: "No runs found" });
    return;
  }
  res.json(run);
});

router.get("/runs/:runId", (req: Request<{ runId: string }>, res: Response) => {
  const run = ds.getRunById(req.params.runId);
  if (!run) {
    res.status(404).json({ error: "Run not found" });
    return;
  }
  res.json(run);
});

router.get("/runs", (_req: Request, res: Response) => {
  res.json(ds.getRunList());
});

router.get("/projects/:name", (req: Request<{ name: string }>, res: Response) => {
  const history = ds.getProjectHistory(req.params.name);
  if (history.length === 0) {
    res.status(404).json({ error: "Project not found" });
    return;
  }
  res.json(history);
});

router.get("/projects", (_req: Request, res: Response) => {
  res.json(ds.getProjectsSummary());
});

router.get("/trends", (_req: Request, res: Response) => {
  res.json(ds.getTrends());
});

export default router;
