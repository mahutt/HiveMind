import { useState } from 'react'
import { Send } from 'lucide-react'
import api from '../api'
import { useSidebar } from '../providers/sidebar-hook'
import type { Chat, Message } from 'models'

export default function Chat() {
  const { toggleChatHistory, toggleSources } = useSidebar()
  const [chat, setChat] = useState<Chat | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)

  const handleSendMessage = async () => {
    setLoading(true)
    let newChat: Chat | null = null

    if (!chat) {
      newChat = (await api.post<Chat>('/api')).data
    }

    const tempMessage: Message = {
      id: chat?.messages.length ?? 0,
      role: 'user',
      content: newMessage,
      timestamp: Date.now(),
    }
    if (newChat) {
      newChat.messages.push(tempMessage)
      setChat(newChat)
    } else if (chat) {
      setChat((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          messages: [...prev.messages, tempMessage],
        }
      })
    }

    const chatId = chat?.id ?? newChat!.id
    const response = api.post<Chat>(`/api/${chatId}`, {
      message: newMessage,
    })
    setNewMessage('')

    const updatedChat = (await response).data
    setChat(updatedChat)
    setLoading(false)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="flex flex-row justify-between p-4">
        <button onClick={toggleChatHistory}>Toggle Chat History</button>
        <div className="font-semibold text-lg">
          {chat?.title ?? 'Blank Chat'}
        </div>
        <button onClick={toggleSources}>Toggle Sources</button>
      </div>

      {/* Messages Container */}
      <div className="w-full max-w-xl mx-auto flex-grow overflow-y-auto p-4 space-y-4">
        {chat?.messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[75%] p-3 rounded-lg ${
                message.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-black'
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
      </div>

      {/* Message Input */}
      <div className="w-full max-w-xl mx-auto p-4 border-t flex items-center space-x-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="Type a message..."
          className="flex-grow p-2 rounded-lg focus:outline-none"
        />
        <button
          onClick={handleSendMessage}
          disabled={loading}
          className={`bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition-colors ${
            loading ? 'opacity-50' : 'opacity-100'
          }`}
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  )
}
