import { Chat, Message } from 'models'
import React, { createContext, useState, ReactNode } from 'react'
import useLocalStorage from 'use-local-storage'

export interface ChatState {
  activeChat: Chat | null
  setActiveChat: React.Dispatch<React.SetStateAction<Chat | null>>
  activeMessage: Message | null
  setActiveMessage: React.Dispatch<React.SetStateAction<Message | null>>
  chatHistory: number[]
  declareNewChat: (chat: Chat) => void
}

const ChatContext = createContext<ChatState | undefined>(undefined)

interface ChatProviderProps {
  children: ReactNode
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const [activeChat, setActiveChat] = useState<Chat | null>(null)
  const [activeMessage, setActiveMessage] = useState<Message | null>(null)
  const [chatHistory, setChatHistory] = useLocalStorage<number[]>(
    'chat-history',
    []
  )

  const declareNewChat = (chat: Chat) => {
    setChatHistory((prev) => [...(prev ?? []), chat.id])
  }

  const value: ChatState = {
    activeChat,
    setActiveChat,
    activeMessage,
    setActiveMessage,
    chatHistory,
    declareNewChat,
  }

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}

export { ChatContext }
