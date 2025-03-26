import { Chat } from 'models'
import React, { createContext, useState, ReactNode } from 'react'

export interface ChatState {
  activeChat: Chat | null
  setActiveChat: React.Dispatch<React.SetStateAction<Chat | null>>
}

const ChatContext = createContext<ChatState | undefined>(undefined)

interface ChatProviderProps {
  children: ReactNode
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const [activeChat, setActiveChat] = useState<Chat | null>(null)

  const value: ChatState = {
    activeChat,
    setActiveChat,
  }

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}

export { ChatContext }
