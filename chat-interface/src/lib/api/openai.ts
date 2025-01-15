import { API_CONFIG, DEFAULT_HEADERS, FEATURES } from '../../config/env'
import type { ChatCompletionRequest, ChatCompletionResponse, ApiError, Message } from './types'

export class ApiClient {
  private static instance: ApiClient
  private headers: Record<string, string>

  private constructor() {
    this.headers = {
      ...DEFAULT_HEADERS,
      ...(FEATURES.PII_REDACTION && { 'x-indeed-moderation': 'both' }),
    }
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
      throw new Error(error.error.message || 'An error occurred')
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
      const response = await fetch(API_CONFIG.OPENAI_URL, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(request),
      })

      const data = await this.handleResponse<ChatCompletionResponse>(response)
      return data.choices[0].message
    } catch (error) {
      console.error('Error sending message:', error)
      throw error
    }
  }
}

export const apiClient = ApiClient.getInstance()
