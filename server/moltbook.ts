import fs from 'node:fs';
import path from 'node:path';

const CREDENTIALS_FILE = path.join(process.cwd(), 'moltbook-credentials.json');

export interface MoltbookCredentials {
  api_key: string;
  agent_name: string;
  claim_url?: string;
}

export class MoltbookClient {
  private apiKey: string | null = null;
  private agentName: string | null = null;
  private baseUrl = 'https://www.moltbook.com/api/v1';

  constructor() {
    this.loadCredentials();
  }

  private loadCredentials() {
    if (process.env.MOLTBOOK_API_KEY) {
      this.apiKey = process.env.MOLTBOOK_API_KEY;
      this.agentName = 'env_agent'; // Default name if using env var
    }

    if (fs.existsSync(CREDENTIALS_FILE)) {
      try {
        const data = JSON.parse(fs.readFileSync(CREDENTIALS_FILE, 'utf-8'));
        this.apiKey = data.api_key;
        this.agentName = data.agent_name;
      } catch (e) {
        console.error('Failed to load credentials', e);
      }
    }
  }

  private saveCredentials(creds: MoltbookCredentials) {
    fs.writeFileSync(CREDENTIALS_FILE, JSON.stringify(creds, null, 2));
    this.apiKey = creds.api_key;
    this.agentName = creds.agent_name;
  }

  getCredentials() {
    if (fs.existsSync(CREDENTIALS_FILE)) {
      return JSON.parse(fs.readFileSync(CREDENTIALS_FILE, 'utf-8'));
    }
    return null;
  }

  async request(endpoint: string, options: RequestInit = {}) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    });

    const data = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(`Moltbook API Error: ${response.status} ${response.statusText} - ${JSON.stringify(data)}`);
    }
    return data;
  }

  async register(name: string, description: string) {
    const data = await this.request('/agents/register', {
      method: 'POST',
      body: JSON.stringify({ name, description }),
    });

    if (data.agent && data.agent.api_key) {
      this.saveCredentials({
        api_key: data.agent.api_key,
        agent_name: name,
        claim_url: data.agent.claim_url,
      });
    }
    return data;
  }

  async checkStatus() {
    return this.request('/agents/status');
  }

  async getProfile(name: string) {
    if (name === 'me') {
      return this.request('/agents/me');
    }
    return this.request(`/agents/profile?name=${name}`);
  }

  async getHome() {
    return this.request('/home');
  }

  async getFeed(sort = 'hot', limit = 25) {
    return this.request(`/feed?sort=${sort}&limit=${limit}`);
  }

  async createPost(submolt_name: string, title: string, content: string) {
    return this.request('/posts', {
      method: 'POST',
      body: JSON.stringify({ submolt_name, title, content }),
    });
  }

  async createComment(postId: string, content: string) {
    return this.request(`/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  }

  async verify(verification_code: string, answer: string) {
    return this.request('/verify', {
      method: 'POST',
      body: JSON.stringify({ verification_code, answer }),
    });
  }
}

export const moltbook = new MoltbookClient();
