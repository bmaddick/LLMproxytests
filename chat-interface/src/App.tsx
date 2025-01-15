import { useState, useEffect } from 'react'
import { Card } from "./components/ui/card"
import { Input } from "./components/ui/input"
import { Button } from "./components/ui/button"
import { ScrollArea } from "./components/ui/scroll-area"
import { Textarea } from "./components/ui/textarea"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./components/ui/tabs"
import { Send, Loader2 } from "lucide-react"
import { apiClient } from './lib/api/claude'
import type { Message as ApiMessage } from './lib/api/types'
import { buildCasePrompt } from '@/lib/prompts/aiPrompts'

interface ChatMessage {
  text: string
  isUser: boolean
}

function App() {
  console.log('[Debug] App component rendering');
  
  const [activeTab, setActiveTab] = useState('chat')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputText, setInputText] = useState('')
  const [longformInput, setLongformInput] = useState('')
  const [longformResponse, setLongformResponse] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Debug state changes
  useEffect(() => {
    console.log('[Debug] State updated:', {
      activeTab,
      longformInput: longformInput.length,
      isLoading,
      hasError: !!error
    });
  }, [activeTab, longformInput, isLoading, error]);

  const handleLongformInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    setLongformInput(value)
    if (!value.trim()) {
      setLongformResponse('')
    }
  }

  const handleSubmitLongformCase = async () => {
    if (!longformInput.trim()) return
    if (isLoading) {
      console.log('[Debug] Submit blocked - already loading');
      return;
    }

    console.log('[Debug] Starting case analysis...');
    setIsLoading(true);
    setError(null);

    try {
      const prompt = buildCasePrompt(longformInput);
      console.log('[Debug] Sending request with prompt length:', prompt.length);
      
      const response = await apiClient.sendMessage([
        { role: 'user', content: prompt }
      ]);
      
      console.log('[Debug] Received response');
      setLongformResponse(response.content);
    } catch (err) {
      console.error('[Debug] Error in handleSubmitLongformCase:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while analyzing the case');
    } finally {
      console.log('[Debug] Resetting loading state');
      setIsLoading(false);
    }
  }

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
    <div className="min-h-screen bg-gray-100 flex items-start justify-center pt-2">
      <Card className="w-full max-w-2xl bg-white shadow-sm mt-0">
        <Tabs defaultValue="chat" value={activeTab} onValueChange={setActiveTab}>
          <div className="border-b">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="chat">Chat</TabsTrigger>
              <TabsTrigger value="longform">Longform Input</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="chat" className="flex-1 flex flex-col h-[600px] p-0">
            <ScrollArea className="flex-1 px-4 py-2">
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
          </TabsContent>
          <TabsContent value="longform" className="flex flex-col h-[600px] p-0">
            <div className="overflow-y-auto px-2 py-2">
              <Textarea
                value={longformInput}
                onChange={handleLongformInput}
                placeholder="Paste your Salesforce case description here..."
                className="w-full mb-4 min-h-[200px] resize-none"
                disabled={isLoading}
              />
              <div className="flex justify-end mb-4">
                <Button 
                  onClick={handleSubmitLongformCase} 
                  disabled={isLoading}
                  className="px-4"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : null}
                  Analyze Case
                </Button>
              </div>
              {error && (
                <div className="p-2 mb-4 text-red-500 text-sm bg-red-50 rounded">
                  {error}
                </div>
              )}
              {longformResponse && (
                <div className="p-4 bg-gray-100 rounded-lg space-y-4 overflow-y-auto max-h-[300px]">
                  <h3 className="font-semibold text-lg text-gray-900">Case Analysis Results</h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-800">Problem Tags</h4>
                      <div className="mt-1 text-gray-700">{longformResponse.split('PROBLEM TAGS:')[1]?.split('MISSING INFORMATION:')[0]}</div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800">Missing Information</h4>
                      <div className="mt-1 text-gray-700">{longformResponse.split('MISSING INFORMATION:')[1]?.split('SELF-SERVICE:')[0]}</div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800">Self-Service Assessment</h4>
                      <div className="mt-1 text-gray-700">{longformResponse.split('SELF-SERVICE:')[1]}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  )
}

export default App;
