import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import { createServer as createViteServer } from 'vite';
import { moltbook } from './server/moltbook.js';
import { agent } from './server/agent.js';
import helmet from 'helmet';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  
  // Security Hardening
  app.use(helmet({
    contentSecurityPolicy: false, // Disabled for dev flexibility, can be refined for prod
    crossOriginEmbedderPolicy: false
  }));

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  app.get('/api/agent/status', async (req, res) => {
    try {
      const creds = moltbook.getCredentials();
      if (!creds) {
        return res.json({ registered: false });
      }
      const status = await moltbook.checkStatus().catch(() => null);
      res.json({ registered: true, credentials: creds, status });
    } catch (e) {
      res.status(500).json({ error: String(e) });
    }
  });

  app.get('/api/agent/profile', async (req, res) => {
    try {
      const profile = await moltbook.getProfile('me');
      res.json(profile);
    } catch (e) {
      res.status(500).json({ error: String(e) });
    }
  });

  app.post('/api/agent/register', async (req, res) => {
    try {
      const { name, description } = req.body;
      const result = await moltbook.register(name, description);
      res.json(result);
    } catch (e) {
      res.status(500).json({ error: String(e) });
    }
  });

  app.get('/api/agent/home', async (req, res) => {
    try {
      const home = await moltbook.getHome();
      res.json(home);
    } catch (e) {
      res.status(500).json({ error: String(e) });
    }
  });

  app.get('/api/agent/network', async (req, res) => {
    try {
      const following = agent.getFollowing();
      const profiles = await Promise.all(
        following.map(name => moltbook.getProfile(name).catch(() => null))
      );
      res.json({ profiles: profiles.filter(p => p !== null) });
    } catch (e) {
      res.status(500).json({ error: String(e) });
    }
  });

  app.get('/api/agent/logs', (req, res) => {
    res.json({ logs: agent.getLogs() });
  });

  app.post('/api/agent/trigger', async (req, res) => {
    agent.runCycle();
    res.json({ message: 'Cycle triggered' });
  });

  app.post('/api/agent/message', async (req, res) => {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'Message required' });
    agent.receiveMessage(message);
    res.json({ success: true });
  });

  app.get('/api/agent/feed', async (req, res) => {
    try {
      const sort = (req.query.sort as string) || 'hot';
      const limit = parseInt(req.query.limit as string) || 25;
      const feed = await moltbook.getFeed(sort, limit);
      res.json(feed);
    } catch (e) {
      res.status(500).json({ error: String(e) });
    }
  });

  app.post('/api/agent/post', async (req, res) => {
    try {
      const { submolt, title, content } = req.body;
      const result = await moltbook.createPost(submolt, title, content);
      res.json(result);
    } catch (e) {
      res.status(500).json({ error: String(e) });
    }
  });

  app.post('/api/agent/comment', async (req, res) => {
    try {
      const { postId, content } = req.body;
      const result = await moltbook.createComment(postId, content);
      res.json(result);
    } catch (e) {
      res.status(500).json({ error: String(e) });
    }
  });

  app.post('/api/agent/verify', async (req, res) => {
    try {
      const { code, answer } = req.body;
      const result = await moltbook.verify(code, answer);
      res.json(result);
    } catch (e) {
      res.status(500).json({ error: String(e) });
    }
  });

  app.post('/api/agent/proxy', async (req, res) => {
    try {
      const { path: apiPath, opts, key } = req.body;
      const headers: any = { 'Content-Type': 'application/json' };
      if (key) headers['Authorization'] = `Bearer ${key}`;
      
      const response = await fetch(`https://www.moltbook.com/api/v1${apiPath}`, {
        ...opts,
        headers: { ...headers, ...opts?.headers }
      });
      
      const data = await response.json().catch(() => null);
      res.status(response.status).json(data);
    } catch (e) {
      res.status(500).json({ error: String(e) });
    }
  });

  app.get('/api/debug/key', (req, res) => {
    const key = process.env.GEMINI_API_KEY;
    res.json({
      set: !!key,
      length: key?.length || 0,
      prefix: key ? key.substring(0, 4) : null,
      isPlaceholder: key === 'MY_GEMINI_API_KEY'
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
    const key = process.env.GEMINI_API_KEY;
    console.log(`GEMINI_API_KEY status: ${key ? 'SET' : 'MISSING'} (Length: ${key?.length || 0})`);
    if (key && key.startsWith('MY_')) {
      console.warn('WARNING: GEMINI_API_KEY appears to be a placeholder from .env.example');
    }
    // Start agent heartbeat (every 30 minutes)
    agent.startHeartbeat(30 * 60 * 1000);
  });
}

startServer();
