export const API_CONFIG = {
  BEDROCK_URL: 'https://llm-proxy.sandbox.indeed.net/bedrock',
  MODEL_ID: 'us.anthropic.claude-3-5-sonnet-20241022-v2:0',
  // Will be populated from environment variables
  API_KEY: import.meta.env.VITE_LLM_API_KEY || '',
}

export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${API_CONFIG.API_KEY}`,
}

// Optional features configuration
export const FEATURES = {
  PII_REDACTION: true,
  MODERATION: true,
}
