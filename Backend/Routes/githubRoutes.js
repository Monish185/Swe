const express = require('express');
const router = express.Router();
const repoController = require('../controllers/repoController');

// POST /api/repos/select - create webhook on repository
router.post('/repos/select', repoController.selectRepo);

// GET /api/repos - list repo webhook mappings for current user
router.get('/repos', repoController.getUserRepos);

// GET /api/repos/:owner/:repo - get mapping for specific repo
router.get('/repos/:owner/:repo', repoController.getRepoInfo);

// DELETE /api/repos/:owner/:repo - remove webhook and mapping
router.delete('/repos/:owner/:repo', repoController.deleteRepoWebhook);

// GitHub webhook endpoint - use raw body to verify signature
router.post('/github/webhook', express.raw({ type: 'application/json' }), repoController.githubWebhookHandler);

module.exports = router;
