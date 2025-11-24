// src/server.js
require('dotenv').config();
const app = require('./app');
const { PORT } = require('./config');

app.listen(PORT, () => {
  console.log(`Gitleaks API listening on port ${PORT}`);
});
