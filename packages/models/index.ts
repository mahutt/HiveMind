// Sample type
export interface ChatMessage {
  id: string
  sender: 'user' | 'bot'
  content: string
  timestamp: number
}
