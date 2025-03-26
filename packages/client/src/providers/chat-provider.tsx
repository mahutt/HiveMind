import { Chat, Message } from 'models'
import React, { createContext, useState, ReactNode } from 'react'

export interface ChatState {
  activeChat: Chat | null
  setActiveChat: React.Dispatch<React.SetStateAction<Chat | null>>
  activeMessage: Message | null
  setActiveMessage: React.Dispatch<React.SetStateAction<Message | null>>
}

const ChatContext = createContext<ChatState | undefined>(undefined)

interface ChatProviderProps {
  children: ReactNode
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const [activeChat, setActiveChat] = useState<Chat | null>(null)
  const [activeMessage, setActiveMessage] = useState<Message | null>(null)

  const value: ChatState = {
    activeChat,
    setActiveChat,
    activeMessage,
    setActiveMessage,
  }

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}

export { ChatContext }
