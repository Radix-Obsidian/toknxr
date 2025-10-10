export const modelToPricing = {
    // Gemini (Free tier available)
    'gemini-2.5-flash': { promptPer1k: 0.15, completionPer1k: 0.60 },
    'gemini-2.5-pro': { promptPer1k: 0.50, completionPer1k: 1.50 },
    'gemini-flash-latest': { promptPer1k: 0.15, completionPer1k: 0.60 },
    'gemini-pro-latest': { promptPer1k: 0.50, completionPer1k: 1.50 },
    // OpenAI (Free tier available for some models)
    'gpt-4o-mini': { promptPer1k: 0.15, completionPer1k: 0.60 },
    'gpt-4o': { promptPer1k: 5.00, completionPer1k: 15.00 },
    // Free tier models (zero cost)
    'ollama-llama3': { promptPer1k: 0.00, completionPer1k: 0.00 },
    'local-model': { promptPer1k: 0.00, completionPer1k: 0.00 },
};

export function estimateCostUSD(model: string, promptTokens: number, completionTokens: number): number {
    const pricing = modelToPricing[model as keyof typeof modelToPricing] || modelToPricing['gemini-2.5-flash'];
    const promptK = promptTokens / 1000;
    const completionK = completionTokens / 1000;
    const cost = promptK * pricing.promptPer1k + completionK * pricing.completionPer1k;
    return Number(cost.toFixed(6));
}