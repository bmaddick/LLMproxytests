export const API_CONFIG = {
  BEDROCK_URL: '/api/bedrock',
  MODEL_ID: 'us.anthropic.claude-3-5-sonnet-20241022-v2:0',
  // Will be populated from environment variables
  API_KEY: import.meta.env.VITE_LLM_API_KEY || '',
}

// Log API configuration status on startup
console.log('[API Config] Authentication status:', {
  keyConfigured: !!API_CONFIG.API_KEY,
  endpoint: API_CONFIG.BEDROCK_URL,
});

export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${API_CONFIG.API_KEY}`,
  'X-Environment': 'development',
  'X-Client-Version': '1.0.0',
}

// Optional features configuration
export const FEATURES = {
  // Disable strict content checks for local development
  PII_REDACTION: import.meta.env.PROD ? true : false,
  MODERATION: import.meta.env.PROD ? true : false,
}
