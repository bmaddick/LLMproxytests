export const API_CONFIG = {
  OPENAI_URL: '/api/openai/chat/completions',
  MODEL_ID: 'gpt-3.5-turbo',
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
