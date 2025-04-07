import { Search, Trash } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Chat } from 'models'
import { useChat } from '../providers/chat-hook'
import api from '../api'
import { LanguageSelector } from './language-selector'
import { Button } from './ui/button'

export default function ChatHistory() {
  const { setActiveChat, chatHistory, setActiveMessage, refresh } = useChat()
  const [searchQuery, setSearchQuery] = useState('')
  const [chats, setChats] = useState<Chat[]>([])

  useEffect(() => {
    const chatPromises = chatHistory.map((chatId) =>
      api.get<Chat>(`/api/${chatId}`).then((response) => response.data)
    )
    Promise.all(chatPromises).then((chats) => {
      setChats(chats)
    })
  }, [chatHistory, refresh])

  const filteredChats = searchQuery
    ? chats.filter((chat) =>
        chat.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : chats

  const chatsByDate = filteredChats.reduce(
    (acc: { [key: string]: Chat[] }, chat) => {
      if (chat.messages.length === 0) return acc
      const timestamp = chat.messages.slice(-1)[0].timestamp
      const dateString = new Date(timestamp).toDateString()
      if (!acc[dateString]) {
        acc[dateString] = []
      }
      acc[dateString].push(chat)
      return acc
    },
    {}
  )

  const sortedDates = Object.keys(chatsByDate).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  )

  const getFormattedDate = (dateString: string) => {
    const today = new Date()
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)

    const date = new Date(dateString)

    if (date.toDateString() === today.toDateString()) {
      return 'Today'
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday'
    } else {
      return dateString
    }
  }

  return (
    <div className="h-full bg-gray-200 flex flex-col rounded-r-lg">
      <div className="p-2">
        <div className="flex items-center bg-white rounded-lg px-3 py-2 shadow-sm">
          <Search className="w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search"
            className="bg-transparent border-none outline-none w-full px-2 py-1 text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-2 pb-2">
        <div className="h-4"></div>

        {sortedDates.map((dateString) => (
          <div key={dateString} className="mb-4">
            <h3 className="text-xs font-semibold text-gray-500 mb-2 px-1 uppercase tracking-wide">
              {getFormattedDate(dateString)}
            </h3>
            {chatsByDate[dateString]
              .sort(
                (a, b) =>
                  b.messages.slice(-1)[0].timestamp -
                  a.messages.slice(-1)[0].timestamp
              )
              .map((chat) => (
                <div
                  key={chat.id}
                  onClick={async () => {
                    const response = await api.get<Chat>(`/api/${chat.id}`)
                    setActiveMessage(null)
                    setActiveChat(response.data)
                  }}
                  className="bg-white rounded-lg p-2 mb-1 cursor-pointer hover:bg-gray-50 transition-colors shadow-sm h-12 flex items-center"
                >
                  <p className="text-sm truncate">{chat.title}</p>
                </div>
              ))}
          </div>
        ))}
        <div className="flex-1">
          <DeleteChatHistoryButton />
        </div>
      </div>
      <div className="p-2">
        <LanguageSelector />
      </div>
    </div>
  )
}

function DeleteChatHistoryButton() {
  const { chatHistory, clearChatHistory, setActiveChat } = useChat()
  if (chatHistory.length === 0) return null
  return (
    <div className="flex items-center justify-center">
      <Button
        className="text-gray-500 hover:text-red-500"
        variant="ghost"
        onClick={() => {
          clearChatHistory()
          setActiveChat(null)
        }}
      >
        <Trash />
        Clear History
      </Button>
    </div>
  )
}
