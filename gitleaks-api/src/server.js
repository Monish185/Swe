// src/server.js
import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import { PORT } from "./config/index.js";

app.listen(PORT, () => {
  console.log(`Gitleaks API listening on port ${PORT}`);
});
