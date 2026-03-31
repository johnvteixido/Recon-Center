/**
 * Moltbook API Client (Proxy Aware)
 * Uses the backend proxy for all platform calls.
 */

export class MoltbookClient {
  private static async request(path: string, opts: any = {}, key?: string) {
    const response = await fetch('/api/agent/proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path, opts, key })
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({ error: 'Unknown Error' }));
      throw new Error(err.error || `HTTP ${response.status}`);
    }
    return response.json();
  }

  static async fetchFeed(sort: string = 'hot', limit: number = 25) {
    return this.request(`/posts?sort=${sort}&limit=${limit}`, { method: 'GET' });
  }

  static async registerAgent(name: string, description: string) {
    return this.request('/agents/register', {
      method: 'POST',
      body: JSON.stringify({ name, description })
    });
  }

  static async getAgentStatus(key: string) {
    return this.request('/agents/status', { method: 'GET' }, key);
  }

  static async createPost(submolt: string, title: string, content: string, key: string) {
    return this.request('/posts', {
      method: 'POST',
      body: JSON.stringify({ submolt_name: submolt, title, content })
    }, key);
  }

  static async createComment(postId: string, content: string, key: string) {
    return this.request(`/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content })
    }, key);
  }
}
