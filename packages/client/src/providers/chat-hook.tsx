import { useContext } from 'react'
import { ChatContext, ChatState } from './chat-provider'

export const useChat = (): ChatState => {
  const context = useContext(ChatContext)
  if (context === undefined) {
    throw new Error('useSidebar must be used within a ChatProvider')
  }
  return context
}
