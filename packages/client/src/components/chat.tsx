import { useState } from 'react'
import { Send } from 'lucide-react'
import api from '../api'
import { useSidebar } from '../providers/sidebar-hook'
import type { Chat, Message } from 'models'
import { useChat } from '../providers/chat-hook'

export default function Chat() {
  const { activeChat, setActiveChat, declareNewChat } = useChat()
  const { toggleChatHistory, toggleSources } = useSidebar()
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)

  const handleSendMessage = async () => {
    setLoading(true)
    let newChat: Chat | null = null

    if (!activeChat) {
      newChat = (await api.post<Chat>('/api')).data
      declareNewChat(newChat)
    }

    const tempMessage: Message = {
      id: activeChat?.messages.length ?? 0,
      role: 'user',
      content: newMessage,
      timestamp: Date.now(),
    }
    if (newChat) {
      newChat.messages.push(tempMessage)
      setActiveChat(newChat)
    } else if (activeChat) {
      setActiveChat((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          messages: [...prev.messages, tempMessage],
        }
      })
    }

    const chatId = activeChat?.id ?? newChat!.id
    const response = api.post<Chat>(`/api/${chatId}`, {
      message: newMessage,
    })
    setNewMessage('')

    const updatedChat = (await response).data
    setActiveChat(updatedChat)
    setLoading(false)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="flex flex-row justify-between p-4">
        <div className="felx flex-row gap-2">
          <button onClick={toggleChatHistory}>Toggle Chat History</button>
          <button
            className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition-colors"
            onClick={() => {
              setActiveChat(null)
              setNewMessage('')
            }}
          >
            +
          </button>
        </div>
        <div className="font-semibold text-lg">
          {activeChat?.title ?? 'Blank Chat'}
        </div>
        <button onClick={toggleSources}>Toggle Sources</button>
      </div>

      {/* Messages Container */}
      <div className="w-full max-w-xl mx-auto flex-grow overflow-y-auto p-4 space-y-4">
        {activeChat?.messages.map((message) => (
          <Message key={message.id} message={message} />
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

function Message({ message }: { message: Message }) {
  const { openSources } = useSidebar()
  const { setActiveMessage } = useChat()
  return (
    <div
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
        {message.citations && message.citations.length > 0 && (
          <button
            className="bg-black text-white rounded mx-2 px-2 cursor-pointer"
            onClick={() => {
              setActiveMessage(message)
              openSources()
            }}
          >
            Sources
          </button>
        )}
      </div>
    </div>
  )
}
