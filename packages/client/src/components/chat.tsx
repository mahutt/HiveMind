import { useState } from 'react'
import { ArrowUp, PanelLeft, SquarePen } from 'lucide-react'
import api from '../api'
import { useSidebar } from '../providers/sidebar-hook'
import type { Chat, Message } from 'models'
import { useChat } from '../providers/chat-hook'
import { Button } from './ui/button'
import MessageLoader from './message-loader'
import TrendingPrompts from './trending-prompts'
import ReactMarkdown from 'react-markdown'
import TextareaAutosize from 'react-textarea-autosize'

export default function Chat() {
  const {
    activeChat,
    setActiveChat,
    declareNewChat,
    setRefresh,
    setExpandedSourceIndex,
  } = useChat()
  const { toggleChatHistory, toggleSources, isSourcesOpen } = useSidebar()
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSendMessage = async () => {
    setLoading(true)
    let newChat: Chat | null = null
    let isNew = false

    if (!activeChat) {
      newChat = (await api.post<Chat>('/api')).data
      isNew = true
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
    if (isNew) {
      api.post<string>(`/api/rename/${updatedChat.id}`).then((response) => {
        const title = response.data
        setActiveChat((prev) => {
          if (!prev) return prev
          return {
            ...prev,
            title: title,
          }
        })
        setRefresh((prev) => !prev)
      })
    }
  }

  return (
    <div className="relative flex flex-col h-screen">
      {/* Chat Header */}
      <div className="flex flex-row justify-between p-4">
        <div className="felx flex-row gap-2">
          <Button variant="ghost" onClick={toggleChatHistory}>
            <PanelLeft />
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              setActiveChat(null)
              setNewMessage('')
            }}
            disabled={!activeChat}
          >
            <SquarePen />
          </Button>
        </div>
        <div className="text-gray-800 font-semibold text hidden sm:block">
          {activeChat?.title ?? 'Blank Chat'}
        </div>
        <Button variant="outline" onClick={toggleSources}>
          {isSourcesOpen ? 'Hide Sources' : 'Show Sources'}
        </Button>
      </div>
      {/* Messages Container */}
      <div className="w-full flex-grow overflow-y-auto p-4 space-y-4 pb-30">
        <>
          {activeChat?.messages.map((message) => (
            <Message
              key={message.id}
              message={message}
              setExpandedSourceIndex={setExpandedSourceIndex}
            />
          ))}
          {loading && <MessageLoader />}
        </>
      </div>
      <div
        className={`absolute left-0 right-0 w-full transition-all duration-300 ease-in-out ${
          !activeChat || activeChat.messages.length === 0
            ? 'bottom-1/2 translate-y-1/2'
            : 'bottom-0'
        }`}
      >
        <div className={`flex items-center justify-center p-4`}>
          <MessageInput
            message={newMessage}
            setMessage={setNewMessage}
            loading={loading}
            handleSendMessage={handleSendMessage}
          />
        </div>
        <TrendingPrompts
          callback={(prompt) => setNewMessage(prompt)}
          visible={newMessage.length === 0 && !activeChat}
        />
      </div>
    </div>
  )
}

function Message({
  message,
  setExpandedSourceIndex,
}: {
  message: Message
  setExpandedSourceIndex: React.Dispatch<React.SetStateAction<number | null>>
}) {
  const { openSources } = useSidebar()
  const { setActiveMessage } = useChat()

  const uniqueSourceIndices =
    message.citations
      ?.filter((citation) => citation.source.index !== undefined)
      .map((citation) => citation.source.index!)
      .filter((index, i, arr) => arr.indexOf(index) === i) || []

  return (
    <div
      className={`flex ${
        message.role === 'user' ? 'justify-end' : 'justify-start'
      } max-w-xl mx-auto`}
    >
      <div
        className={`relative max-w-[85%] p-3 rounded-lg ${
          message.role === 'user'
            ? 'bg-conu text-white'
            : 'bg-gray-200 text-black'
        }`}
      >
        <ReactMarkdown>{message.content}</ReactMarkdown>

        {uniqueSourceIndices.length > 0 && (
          <div className="absolute -bottom-2 -right-2 flex items-center space-x-2">
            {uniqueSourceIndices.map((index) => (
              <button
                key={index}
                className="text-sm bg-black text-white rounded-full w-6 h-6 flex items-center justify-center cursor-pointer"
                onClick={() => {
                  setActiveMessage(message)
                  openSources()
                  setExpandedSourceIndex(index)
                }}
              >
                {index}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function MessageInput({
  message,
  setMessage,
  loading,
  handleSendMessage,
}: {
  message: string
  setMessage: (message: string) => void
  loading: boolean
  handleSendMessage: () => void
}) {
  return (
    <div className="w-full max-w-xl mx-auto p-4 flex items-start space-x-2 rounded-[28px] border shadow-sm sm:shadow-lg bg-white">
      <TextareaAutosize
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
        placeholder="Ask a question..."
        className="flex-grow p-2 rounded-lg focus:outline-none resize-none"
      />
      <button
        onClick={handleSendMessage}
        disabled={loading}
        className={`bg-conu text-white p-2 rounded-full hover:bg-[rgb(173,43,67)] transition-colors ${
          loading ? 'opacity-50' : 'opacity-100'
        }`}
      >
        <ArrowUp />
      </button>
    </div>
  )
}
