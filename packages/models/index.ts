export interface Message {
  id: number
  role: 'user' | 'assistant'
  content: string
  timestamp: number
  snippets?: Snippet[]
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
}

export interface Snippet {
  id: number
  text: string
  source: Source
}
