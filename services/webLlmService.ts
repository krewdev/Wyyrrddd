import { CreateMLCEngine, MLCEngine, InitProgressCallback } from "@mlc-ai/web-llm";

// Use a smaller model for faster load times and wider compatibility
const SELECTED_MODEL = "Llama-3.2-1B-Instruct-q4f32_1-MLC";

class WebLLMService {
  private engine: MLCEngine | null = null;
  private isInitializing = false;
  private initPromise: Promise<void> | null = null;

  async initialize(onProgress?: InitProgressCallback) {
    if (this.engine) return;
    if (this.isInitializing) return this.initPromise;

    this.isInitializing = true;
    
    this.initPromise = (async () => {
      try {
        this.engine = await CreateMLCEngine(
          SELECTED_MODEL,
          { initProgressCallback: onProgress }
        );
        console.log("WebLLM Initialized");
      } catch (error) {
        console.error("Failed to initialize WebLLM:", error);
        throw error;
      } finally {
        this.isInitializing = false;
      }
    })();

    return this.initPromise;
  }

  async generateResponse(prompt: string): Promise<string> {
    if (!this.engine) {
      await this.initialize();
    }
    
    if (!this.engine) {
        throw new Error("Engine failed to initialize");
    }

    try {
      const messages = [
        { role: "system" as const, content: "You are a helpful AI assistant integrated into a high-tech web interface." },
        { role: "user" as const, content: prompt }
      ];

      const reply = await this.engine.chat.completions.create({
        messages,
      });

      return reply.choices[0].message.content || "";
    } catch (error) {
      console.error("Generation failed:", error);
      return "Error generating response.";
    }
  }
  
  async generateJSON(prompt: string, schema?: any): Promise<any> {
       if (!this.engine) {
      await this.initialize();
    }
    
    if (!this.engine) {
        throw new Error("Engine failed to initialize");
    }

    try {
        // Llama 3 supports JSON mode or structured output via prompting
        const systemPrompt = "You are a JSON generator. Output ONLY valid JSON. Do not add markdown formatting or explanations.";
        const messages = [
            { role: "system" as const, content: systemPrompt },
            { role: "user" as const, content: prompt }
        ];
        
        const reply = await this.engine.chat.completions.create({
            messages,
            response_format: { type: "json_object" }
        });
        
        const content = reply.choices[0].message.content || "{}";
        return JSON.parse(content);
    } catch (error) {
        console.error("JSON generation failed:", error);
        return {};
    }
  }
}

export const webLlmService = new WebLLMService();
