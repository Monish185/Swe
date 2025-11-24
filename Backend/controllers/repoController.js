const axios = require('axios');
const User = require('../models/userModel');

const WEBHOOK_URL = process.env.WEBHOOK_URL || 'https://my-domain.com/api/github/webhook';
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || 'MY_SECRET';

/**
 * POST /api/repos/select
 * body: { owner, repo }
 */
exports.selectRepo = async (req, res) => {
  try {
    const { owner, repo } = req.body || {};
    console.log('selectRepo called with:', owner, repo);

    if (!owner || !repo) {
      return res.status(400).json({ error: 'owner and repo are required' });
    }

    const userId = req.session && req.session.userId;
    console.log('selectRepo userId from session:', userId);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await User.findById(userId);
    console.log('selectRepo found user:', user ? user.username : 'not found');
    if (!user || !user.access_token) {
      return res.status(401).json({ error: 'User token not found' });
    }

    const githubApiUrl = `https://api.github.com/repos/${owner}/${repo}/hooks`;

    const payload = {
      name: 'web',
      active: true,
      events: ['push'],
      config: {
        url: WEBHOOK_URL,
        content_type: 'json',
        secret: WEBHOOK_SECRET,
      },
    };

    const response = await axios.post(githubApiUrl, payload, {
      headers: {
        Authorization: `Bearer ${user.access_token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    const webhook = response.data;

    // store webhook id mapped to user + repo
    user.repos = user.repos || [];
    // replace existing entry for same owner/repo if present
    const idx = user.repos.findIndex(r => r.owner === owner && r.repo === repo);
    const entry = { owner, repo, webhookId: webhook.id, createdAt: webhook.created_at || Date.now() };
    if (idx >= 0) user.repos[idx] = entry;
    else user.repos.push(entry);

    await user.save();

    return res.status(201).json({ message: 'Webhook created', webhookId: webhook.id, webhook });
  } catch (err) {
    const status = err.response?.status || 500;
    const details = err.response?.data || err.message;
    return res.status(status).json({ error: 'Failed to create webhook', details });
  }
};

/**
 * GET /api/repos
 * Return the current user's repo webhook mappings
 */
exports.getUserRepos = async (req, res) => {
  try {
    const userId = req.session && req.session.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const user = await User.findById(userId).select('repos');
    if (!user) return res.status(404).json({ error: 'User not found' });

    return res.status(200).json({ repos: user.repos || [] });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch repos', details: err.message });
  }
};

/**
 * GET /api/repos/:owner/:repo
 * Return webhook mapping for a specific repo if present
 */
exports.getRepoInfo = async (req, res) => {
  try {
    const userId = req.session && req.session.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { owner, repo } = req.params;
    if (!owner || !repo) return res.status(400).json({ error: 'owner and repo required' });

    const user = await User.findById(userId).select('repos');
    if (!user) return res.status(404).json({ error: 'User not found' });

    const entry = (user.repos || []).find(r => r.owner === owner && r.repo === repo);
    if (!entry) return res.status(404).json({ error: 'No webhook configured for this repo' });

    return res.status(200).json({ repo: entry });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch repo info', details: err.message });
  }
};

/**
 * DELETE /api/repos/:owner/:repo
 * Remove webhook from GitHub and delete mapping from user's stored repos
 */
exports.deleteRepoWebhook = async (req, res) => {
  try {
    const userId = req.session && req.session.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { owner, repo } = req.params;
    if (!owner || !repo) return res.status(400).json({ error: 'owner and repo required' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const entry = (user.repos || []).find(r => r.owner === owner && r.repo === repo);
    if (!entry || !entry.webhookId) return res.status(404).json({ error: 'No webhook configured for this repo' });

    // Delete webhook from GitHub
    const hookId = entry.webhookId;
    const deleteUrl = `https://api.github.com/repos/${owner}/${repo}/hooks/${hookId}`;

    try {
      await axios.delete(deleteUrl, {
        headers: {
          Authorization: `Bearer ${user.access_token}`,
          Accept: 'application/vnd.github.v3+json',
        },
      });
    } catch (err) {
      // If GitHub returns 404, still remove local mapping
      if (err.response && err.response.status !== 404) {
        const status = err.response?.status || 500;
        const details = err.response?.data || err.message;
        return res.status(status).json({ error: 'Failed to delete webhook on GitHub', details });
      }
    }

    // remove mapping locally
    user.repos = (user.repos || []).filter(r => !(r.owner === owner && r.repo === repo));
    await user.save();

    return res.status(200).json({ message: 'Webhook removed' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to remove webhook', details: err.message });
  }
};

/**
 * POST /api/github/webhook
 * This handler expects raw body middleware (express.raw) to compute signature.
 */
exports.githubWebhookHandler = async (req, res) => {
  const { verifySignature } = require('../utils/verifySignature');
  const { runCustomPipeline } = require('../services/pipeline');

  const signature = req.headers['x-hub-signature-256'] || '';
  const event = req.headers['x-github-event'];

  const secret = process.env.WEBHOOK_SECRET || 'MY_SECRET';

  try {
    const rawBody = req.body; // Buffer when using express.raw

    if (!verifySignature(rawBody, signature, secret)) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    if (event !== 'push') {
      return res.status(200).json({ message: 'Event ignored' });
    }

    const payload = JSON.parse(rawBody.toString('utf8'));

    const repoFull = payload?.repository?.full_name; // owner/repo
    const repoName = payload?.repository?.name;
    const owner = payload?.repository?.owner?.login;
    const ref = payload?.ref; // refs/heads/branch
    const branch = ref ? ref.replace('refs/heads/', '') : undefined;
    const commitId = payload?.after;

    // find user by webhook id stored in users
    // payload.hook ? but repository webhook id is not included in push event
    // We'll attempt to find by owner+repo mapping in users

    // find a user owning this webhook mapping
    const user = await User.findOne({ 'repos.owner': owner, 'repos.repo': repoName });

    const userId = user ? user._id : null;

    // Call custom pipeline (placeholder)
    await runCustomPipeline(userId, `${owner}/${repoName}`, branch, commitId);

    return res.status(200).json({ message: 'Webhook processed' });
  } catch (err) {
    console.error('Webhook processing error', err);
    return res.status(500).json({ error: 'Webhook handling failed', details: err.message });
  }
};
