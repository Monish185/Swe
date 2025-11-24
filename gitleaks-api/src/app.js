// src/app.js
const express = require('express');
const cors = require('cors');
const scanRoutes = require('./routes/scan.routes');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Gitleaks API is running' });
});

app.use('/scan', scanRoutes);

module.exports = app;
