export interface Message {
  role: 'user' | 'assistant'
  content: string
}

export interface ChatCompletionRequest {
  model: string
  messages: Message[]
  temperature?: number
}

export interface ChatCompletionResponse {
  choices: Array<{
    message: Message
    finish_reason: string
  }>
}

export interface ApiError {
  error: {
    message: string
    type: string
    code?: string
  }
}
