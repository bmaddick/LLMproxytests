import { API_CONFIG, DEFAULT_HEADERS, FEATURES } from '../../config/env'
import type { ChatCompletionRequest, ChatCompletionResponse, ApiError, Message } from './types'

export class ApiClient {
  private static instance: ApiClient
  private headers: Record<string, string>

  private constructor() {
    // Initialize headers based on environment and feature flags
    this.headers = {
      ...DEFAULT_HEADERS,
      ...(FEATURES.PII_REDACTION && { 'x-indeed-moderation': 'both' }),
      ...(FEATURES.MODERATION && { 'x-content-filter': 'enabled' }),
    }

    // Log feature configuration
    console.log('[API Client] Feature configuration:', {
      piiRedaction: FEATURES.PII_REDACTION,
      moderation: FEATURES.MODERATION,
    });
  }

  public static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient()
    }
    return ApiClient.instance
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error = await response.json() as ApiError
      
      // Enhanced error handling with specific messages
      let errorMessage = error.error.message || 'An error occurred';
      
      switch (response.status) {
        case 403:
          errorMessage = 'Authentication failed. Please check your API key and permissions.';
          console.error('[API Error] Authentication failed:', {
            status: response.status,
            originalError: error.error,
          });
          break;
        case 400:
          if (errorMessage.includes('inappropriate content')) {
            errorMessage = 'Content moderation triggered. Please review your input for sensitive content.';
            console.warn('[API Warning] Content moderation triggered:', {
              status: response.status,
              originalError: error.error,
            });
          }
          break;
        default:
          console.error('[API Error] Unexpected error:', {
            status: response.status,
            originalError: error.error,
          });
      }
      
      throw new Error(errorMessage)
    }
    return response.json() as Promise<T>
  }

  public async sendMessage(messages: Message[]): Promise<Message> {
    if (!API_CONFIG.API_KEY) {
      throw new Error('API key is not configured')
    }

    const request: ChatCompletionRequest = {
      model: API_CONFIG.MODEL_ID,
      messages,
      temperature: 0.7,
    }

    try {
      // Log request details for debugging
      console.log('[API Request]', {
        url: API_CONFIG.BEDROCK_URL,
        headers: {
          ...this.headers,
          'Authorization': 'Bearer ' + (this.headers.Authorization ? '[REDACTED]' : 'MISSING'),
        },
      });

      // Log minimal request details for debugging
      console.log('[API Request] Sending message:', {
        messageCount: messages.length,
        contentLength: JSON.stringify(request).length,
      });

      console.log('[API Debug] Sending request:', {
        url: API_CONFIG.BEDROCK_URL,
        method: 'POST',
        headers: {
          ...this.headers,
          'Authorization': this.headers.Authorization ? '[REDACTED]' : 'MISSING'
        },
        bodyLength: JSON.stringify(request).length
      });

      const response = await fetch(API_CONFIG.BEDROCK_URL, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(request),
      });

      console.log('[API Debug] Received response:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });

      const responseText = await response.text();
      console.log('[API Debug] Response body:', {
        length: responseText.length,
        preview: responseText.substring(0, 100)
      });

      const data = JSON.parse(responseText) as ChatCompletionResponse;
      return data.choices[0].message
    } catch (error) {
      // Enhanced error logging for content moderation
      if (error instanceof Error) {
        if (error.message.includes('Content moderation')) {
          console.warn('[API Warning] Content moderation details:', {
            messages: messages.map(m => ({ role: m.role, length: m.content.length })),
            error: error.message,
          });
        } else if (error.message.includes('Authentication failed')) {
          console.error('[API Error] Authentication failed:', {
            error: error.message,
          });
        } else {
          console.error('[API Error] Unexpected error:', error);
        }
      }
      throw error
    }
  }
}

export const apiClient = ApiClient.getInstance()
