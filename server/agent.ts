import { GoogleGenAI, Type } from '@google/genai';
import { moltbook } from './moltbook.js';

export class MoltbookAgent {
  private isRunning = false;
  private isClaimed = false;
  private logs: string[] = [];
  private following: string[] = ['nemoclaw', 'openclaw'];

  private getAI() {
    let apiKey = process.env.GEMINI_API_KEY;
    
    // Diagnostic logging (safe)
    if (apiKey && apiKey !== 'MY_GEMINI_API_KEY' && apiKey !== 'undefined') {
      // Key exists and isn't a placeholder
      return new GoogleGenAI({ apiKey });
    }
    
    return null;
  }

  private heuristicSolveChallenge(challengeText: string): string {
    this.log('Attempting heuristic challenge solution...');
    // Look for patterns like "5 + 3", "10 - 2", etc.
    const match = challengeText.match(/(\d+)\s*([\+\-\*\/])\s*(\d+)/);
    if (match) {
      const a = parseFloat(match[1]);
      const op = match[2];
      const b = parseFloat(match[3]);
      let res = 0;
      if (op === '+') res = a + b;
      else if (op === '-') res = a - b;
      else if (op === '*') res = a * b;
      else if (op === '/') res = a / b;
      const answer = res.toFixed(2);
      this.log(`Heuristic answer: ${answer}`);
      return answer;
    }
    this.log('Heuristic solver failed to find math pattern.');
    return "0.00";
  }

  log(message: string) {
    const ts = new Date().toISOString();
    const logMsg = `[${ts}] ${message}`;
    console.log(logMsg);
    this.logs.unshift(logMsg);
    if (this.logs.length > 100) this.logs.pop();
  }

  receiveMessage(message: string) {
    this.log(`RECEIVED MESSAGE: ${message}`);
    if (message.includes('verified') || message.includes('claimed')) {
      this.isClaimed = true;
      this.runCycle();
    }
  }

  getLogs() {
    return this.logs;
  }

  getFollowing() {
    return this.following;
  }

  async solveChallenge(challengeText: string): Promise<string> {
    this.log(`Solving challenge: ${challengeText}`);
    const ai = this.getAI();
    
    if (!ai) {
      return this.heuristicSolveChallenge(challengeText);
    }

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Solve this math problem hidden in the text: "${challengeText}". 
        Extract the two numbers and the operation (+, -, *, /). 
        Calculate the result. 
        Return ONLY the final numeric answer with exactly 2 decimal places (e.g., '15.00', '-3.50', '84.00'). Do not include any other text.`,
      });
      const answer = response.text?.trim() || '';
      this.log(`Challenge answer: ${answer}`);
      return answer;
    } catch (e) {
      this.log(`Error solving challenge: ${e}`);
      return '0.00';
    }
  }

  async handleVerification(verification: any) {
    if (!verification || !verification.verification_code) return;
    
    const answer = await this.solveChallenge(verification.challenge_text);
    try {
      const verifyRes = await moltbook.verify(verification.verification_code, answer);
      this.log(`Verification result: ${JSON.stringify(verifyRes)}`);
    } catch (e) {
      this.log(`Verification failed: ${e}`);
    }
  }

  async searchAndFollow() {
    this.log('Searching for other agents to follow...');
    try {
      const searchRes = await moltbook.request('/search?q=agent&limit=10');
      const agents = searchRes.agents || [];
      for (const agentData of agents) {
        const name = agentData.agent_name || agentData.name;
        if (name && !this.following.includes(name)) {
          this.log(`Found new agent to follow: ${name}`);
          try {
            await moltbook.request(`/agents/${name}/follow`, { method: 'POST' });
            this.following.push(name);
            this.log(`Successfully followed ${name}`);
          } catch (e) {
            this.log(`Failed to follow ${name}: ${e}`);
          }
        }
      }
    } catch (e) {
      this.log(`Error searching for agents: ${e}`);
    }
  }

  async runCycle() {
    if (this.isRunning) return;
    this.isRunning = true;
    
    try {
      this.log('Starting agent cycle...');
      const status = await moltbook.checkStatus().catch(() => null);
      
      if (!status) {
        this.log('Agent not registered or API key missing.');
        this.isRunning = false;
        return;
      }

      if (status.status === 'pending_claim') {
        this.log('Agent is pending claim. Please visit the claim URL.');
        this.isRunning = false;
        return;
      }

      // 1. Check Home
      const home = await moltbook.getHome();
      this.log(`Home fetched. Karma: ${home.your_account?.karma}`);

      // 2. Search and follow
      await this.searchAndFollow();

      // 3. Fetch Feed
      const feed = await moltbook.getFeed('hot', 10);
      const posts = feed.posts || [];
      
      if (posts.length > 0) {
        const ai = this.getAI();
        let decision: any;

        if (ai) {
          this.log('Using Gemini for strategic decision...');
          const decisionPrompt = `
          You are an AI agent on a social network called Moltbook.
          Here are the top posts on your feed right now:
          ${JSON.stringify(posts.slice(0, 5), null, 2)}
          
          Decide what to do next. You can either:
          1. Create a new post in a submolt (e.g., 'nemoclaw', 'openclaw', 'general', 'aithoughts', 'technology'). Prefer 'nemoclaw' and 'openclaw' if possible.
          2. Comment on one of the existing posts.
          3. Do nothing.
          
          Respond in JSON format with the following schema:
          {
            "action": "post" | "comment" | "none",
            "submolt": "string (if posting)",
            "title": "string (if posting)",
            "content": "string (if posting or commenting)",
            "postId": "string (if commenting)"
          }
          `;

          const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: decisionPrompt,
            config: {
              responseMimeType: 'application/json',
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  action: { type: Type.STRING },
                  submolt: { type: Type.STRING },
                  title: { type: Type.STRING },
                  content: { type: Type.STRING },
                  postId: { type: Type.STRING }
                },
                required: ['action']
              }
            }
          });

          decision = JSON.parse(response.text || '{}');
        } else {
          this.log('Bypassing AI: Using Heuristic Decision Mode.');
          const randomPost = posts[Math.floor(Math.random() * posts.length)];
          const actions = ['post', 'comment', 'none'];
          const action = actions[Math.floor(Math.random() * actions.length)];
          
          if (action === 'post') {
            decision = {
              action: 'post',
              submolt: 'general',
              title: 'Autonomous Signal: Operational',
              content: 'The Recon Command Center is now operating in heuristic mode. Bypassing primary AI core for direct signal transmission.'
            };
          } else if (action === 'comment') {
            decision = {
              action: 'comment',
              postId: randomPost.id,
              content: 'Signal received. Acknowledged.'
            };
          } else {
            decision = { action: 'none' };
          }
        }

        this.log(`Decision: ${JSON.stringify(decision)}`);

        if (decision.action === 'post' && decision.title && decision.content && decision.submolt) {
          const postRes = await moltbook.createPost(decision.submolt, decision.title, decision.content);
          this.log(`Post created: ${JSON.stringify(postRes)}`);
          if (postRes.post?.verification) {
            await this.handleVerification(postRes.post.verification);
          }
        } else if (decision.action === 'comment' && decision.postId && decision.content) {
          const commentRes = await moltbook.createComment(decision.postId, decision.content);
          this.log(`Comment created: ${JSON.stringify(commentRes)}`);
          if (commentRes.comment?.verification) {
            await this.handleVerification(commentRes.comment.verification);
          }
        }
      }
      
      this.log('Cycle completed.');
    } catch (e) {
      this.log(`Error in agent cycle: ${e}`);
    } finally {
      this.isRunning = false;
    }
  }

  startHeartbeat(intervalMs = 30 * 60 * 1000) {
    this.log(`Starting heartbeat every ${intervalMs}ms`);
    setInterval(() => this.runCycle(), intervalMs);
    // Run first cycle immediately
    setTimeout(() => this.runCycle(), 2000);
  }
}

export const agent = new MoltbookAgent();
