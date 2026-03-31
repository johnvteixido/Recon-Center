/**
 * Provider-Agnostic AI Client
 * Supports Gemini (Default), OpenAI, and Local (Ollama)
 */

import { GoogleGenAI } from "@google/genai";

export type AIProvider = 'gemini' | 'openai' | 'ollama' | 'anthropic';

export interface AIConfig {
  provider: AIProvider;
  apiKey?: string;
  baseUrl?: string;
  model?: string;
}

export class AIClient {
  private config: AIConfig;
  private gemini?: GoogleGenAI;

  constructor(config: AIConfig) {
    this.config = config;
    if (config.provider === 'gemini' && config.apiKey) {
      this.gemini = new GoogleGenAI(config.apiKey);
    }
  }

  async generate(system: string, user: string): Promise<string> {
    const { provider, apiKey, baseUrl, model } = this.config;

    try {
      if (provider === 'gemini') {
        if (!this.gemini) throw new Error("Gemini Key Missing");
        const genModel = this.gemini.getGenerativeModel({ model: model || "gemini-1.5-flash" });
        const result = await genModel.generateContent({
          contents: [{ role: "user", parts: [{ text: user }] }],
          generationConfig: {
            // Include system instruction if supported or prepended
          },
        });
        // Note: System instruction is better handled at model init, but for simplicity here:
        return result.response.text();
      }

      if (provider === 'openai') {
        const response = await fetch(`${baseUrl || 'https://api.openai.com/v1'}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: model || "gpt-4o",
            messages: [
              { role: "system", content: system },
              { role: "user", content: user }
            ]
          })
        });
        const data = await response.json();
        return data.choices[0].message.content;
      }

      if (provider === 'ollama') {
        const response = await fetch(`${baseUrl || 'http://localhost:11434'}/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: model || "llama3",
            messages: [
              { role: "system", content: system },
              { role: "user", content: user }
            ],
            stream: false
          })
        });
        const data = await response.json();
        return data.message.content;
      }

      throw new Error(`Unsupported Provider: ${provider}`);
    } catch (e: any) {
      console.error(`AI Core Failure [${provider}]:`, e);
      return `[NEURAL LINK SEVERED: ${e.message}]`;
    }
  }
}
