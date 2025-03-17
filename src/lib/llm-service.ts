// src/lib/llm-service.ts
import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import { cacheService } from "./cache-service";

export const llmService = {
  activeProvider: { provider: "openai", model: "gpt-3.5-turbo" },
  keysCache: new Map(),

  async getApiKey(provider = "openai"): Promise<string> {
    if (this.keysCache.has(provider)) return this.keysCache.get(provider);
    const key = provider === "openai" ? process.env.OPENAI_API_KEY : process.env.ANTHROPIC_API_KEY;
    if (!key) throw new Error(`No API key for ${provider}`);
    this.keysCache.set(provider, key);
    return key;
  },

  getActiveProvider() {
    return this.activeProvider;
  },

  async getAvailableProviders() {
    return [
      { name: "OpenAI", id: "openai", models: ["gpt-3.5-turbo", "gpt-4o-mini"] },
      { name: "Anthropic", id: "anthropic", models: ["claude-3-haiku", "claude-3.5-sonnet"] },
    ];
  },

  async setActiveProvider(provider: string, model: string): Promise<boolean> {
    const apiKey = await this.getApiKey(provider);
    if (!apiKey) return false;
    this.activeProvider = { provider, model };
    return true;
  },

  async getCompletion(prompt: string): Promise<string> {
    const cachedResponse = await cacheService.getCachedResponse(prompt);
    if (cachedResponse) {
      console.log("Using cached LLM response");
      return cachedResponse;
    }

    const { provider, model } = this.activeProvider;
    const apiKey = await this.getApiKey(provider);

    let response = "";
    if (provider === "openai") {
      const openai = new OpenAI({ apiKey });
      console.log("Calling OpenAI API with prompt:", prompt.slice(0, 100));
      const completion = await openai.chat.completions.create({
        model,
        messages: [
          { role: "system", content: "You are a helpful assistant analyzing web content." },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 800,
      });
      response = completion.choices[0]?.message?.content || "No response generated";
    } else if (provider === "anthropic") {
      const anthropic = new Anthropic({ apiKey });
      console.log("Calling Anthropic API with prompt:", prompt.slice(0, 100));
      const completion = await anthropic.messages.create({
        model,
        max_tokens: 800,
        system: "You are a helpful assistant analyzing web content.",
        messages: [{ role: "user", content: prompt }],
      });
      const contentBlock = completion.content[0];
      response = contentBlock.type === "text" ? contentBlock.text : "No text response generated";
    }

    await cacheService.cacheResponse(prompt, response, provider, model);
    return response;
  },

  estimateTokenCount(text: string): number {
    const words = (text.match(/\b\w+\b/g) || []).length;
    const cjk = (text.match(/[\u3000-\u9fff]/g) || []).length;
    return Math.ceil(words * 1.33 + cjk);
  },
};

export default llmService;