// src/app.js
import express from "express";
import cors from "cors";
import scanRoutes from "./routes/scan.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Gitleaks API is running" });
});

app.use("/scan", scanRoutes);

export default app;
