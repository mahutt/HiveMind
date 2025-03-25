export interface Message {
  id: number
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

export interface Chat {
  id: number
  title: string
  messages: Message[]
}
