import { Chat, Message } from 'models'
import React, { createContext, useState, ReactNode, useEffect } from 'react'
import useLocalStorage from 'use-local-storage'

export interface ChatState {
  activeChat: Chat | null
  setActiveChat: React.Dispatch<React.SetStateAction<Chat | null>>
  activeMessage: Message | null
  setActiveMessage: React.Dispatch<React.SetStateAction<Message | null>>
  chatHistory: number[]
  clearChatHistory: () => void
  declareNewChat: (chat: Chat) => void
  refresh: boolean
  setRefresh: React.Dispatch<React.SetStateAction<boolean>>
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
  const [refresh, setRefresh] = useState(true)

  const declareNewChat = (chat: Chat) => {
    setChatHistory((prev) => [...(prev ?? []), chat.id])
  }

  const clearChatHistory = () => {
    setChatHistory([])
  }

  useEffect(() => {
    setActiveMessage(null)
  }, [activeChat])

  const value: ChatState = {
    activeChat,
    setActiveChat,
    activeMessage,
    setActiveMessage,
    chatHistory,
    clearChatHistory,
    declareNewChat,
    refresh,
    setRefresh,
  }

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}

export { ChatContext }
