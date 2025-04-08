export interface Message {
  id: number
  role: 'user' | 'assistant'
  content: string
  timestamp: number
  citations?: Citation[]
}

export interface Chat {
  id: number
  title: string
  messages: Message[]
}

export interface Source {
  id: number
  title: string
  url: string
  index?: number
}

export interface Citation {
  id: number
  text: string
  source: Source
}
