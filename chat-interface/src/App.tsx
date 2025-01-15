import { useState } from 'react'
import { Card } from "./components/ui/card"
import { Input } from "./components/ui/input"
import { Button } from "./components/ui/button"
import { ScrollArea } from "./components/ui/scroll-area"
import { Send } from "lucide-react"
import { apiClient } from './lib/api/openai'
import type { Message as ApiMessage } from './lib/api/types'

interface ChatMessage {
  text: string
  isUser: boolean
}

function App() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputText, setInputText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSend = async () => {
    if (inputText.trim() && !isLoading) {
      const userMessage: ChatMessage = { text: inputText, isUser: true }
      setMessages(prev => [...prev, userMessage])
      setInputText('')
      setError(null)
      setIsLoading(true)

      try {
        const apiMessages: ApiMessage[] = messages.concat(userMessage).map(msg => ({
          role: msg.isUser ? 'user' : 'assistant',
          content: msg.text
        }))

        const response = await apiClient.sendMessage(apiMessages)
        
        setMessages(prev => [...prev, {
          text: response.content,
          isUser: false
        }])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred while sending the message')
        console.error('Error:', err)
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 flex items-center justify-center">
      <Card className="w-full max-w-2xl bg-white">
        <div className="flex flex-col h-[600px]">
          <div className="p-4 border-b">
            <h2 className="text-xl font-semibold">Chat with OpenAI</h2>
          </div>
          
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`rounded-lg px-4 py-2 max-w-sm ${
                      message.isUser
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    {message.text}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          {error && (
            <div className="p-2 m-4 text-red-500 text-sm bg-red-50 rounded">
              {error}
            </div>
          )}
          <div className="p-4 border-t flex gap-2">
            <Input
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1"
              disabled={isLoading}
            />
            <Button 
              onClick={handleSend} 
              className="px-4"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default App
