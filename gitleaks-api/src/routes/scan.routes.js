// src/routes/scan.routes.js
import express from "express";
import { scanRepo } from "../controllers/scan.controller.js";

const router = express.Router();

// POST /scan/repo
router.post("/repo", scanRepo);

export default router;
