import express from "express";
import cors from "cors";
import apiRouter from "./routes/api";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use("/api", apiRouter);

app.listen(PORT, () => {
  console.log(`QA Dashboard API server running on http://localhost:${PORT}`);
});
