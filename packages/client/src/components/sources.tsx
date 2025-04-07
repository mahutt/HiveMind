import { MoveUpRight } from 'lucide-react'
import { useChat } from '../providers/chat-hook'
import { Chat, Message, Source } from 'models'

function extractUniqueSources(chat: Chat): Source[] {
  const uniqueSourcesMap = new Map<string, Source>()
  chat.messages.forEach((message) => {
    if (message.citations) {
      message.citations.forEach((citation) => {
        uniqueSourcesMap.set(`${citation.source.id}`, citation.source)
      })
    }
  })
  return Array.from(uniqueSourcesMap.values())
}

function extractUniqueSourcesFromMessage(message: Message): Source[] {
  const uniqueSourcesMap = new Map<string, Source>()
  if (message.citations) {
    message.citations.forEach((citation) => {
      uniqueSourcesMap.set(`${citation.source.id}`, citation.source)
    })
  }
  return Array.from(uniqueSourcesMap.values())
}

export default function Sources() {
  const { activeChat, activeMessage } = useChat()

  const sources = activeChat ? extractUniqueSources(activeChat) : []

  return (
    <div className="h-full bg-gray-200 rounded-l-lg px-6 pt-6 text-white space-y-4">
      {sources.length === 0 && (
        <>
          <h2 className="text-gray-500 mb-2">Conversation Sources</h2>
          <p className="text-md text-gray-500 my-6">
            Start chatting to see where HiveMind gets its information from...
          </p>
        </>
      )}

      {activeMessage && activeMessage.citations?.length !== 0 && (
        <div>
          <h2 className="text-gray-500 mb-2">Selected Message Sources</h2>
          <div className="flex flex-col gap-2">
            {extractUniqueSourcesFromMessage(activeMessage).map((source) => (
              <SourceLink
                key={source.url}
                url={source.url}
                title={source.title}
              />
            ))}
          </div>
        </div>
      )}

      {sources.length > 0 && (
        <div>
          <h2 className="text-gray-500 mb-2">All Conversation Sources</h2>
          <div className="flex flex-col gap-2">
            {sources.map((source) => (
              <SourceLink
                key={source.id}
                url={source.url}
                title={source.title}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// function stripUrlProtocol(url: string) {
//   return url.replace(/(^\w+:|^)\/\//, '')
// }

// function SourceCard({ citation }: { citation: Citation }) {
//   return (
//     <a href={citation.source.url} target="_blank" rel="noopener noreferrer">
//       <div className="bg-white rounded-md p-4 text-gray-800">
//         <div className="flex justify-between items-center text-sm font-medium">
//           <div className="flex-1 flex items-center">
//             <span className="w-4 h-4 bg-red-800 rounded-full mr-2"></span>
//             <div className="flex-1">
//               {stripUrlProtocol(citation.source.url)}
//             </div>
//           </div>
//           <MoveUpRight className="h-4 w-4 ml-1" />
//         </div>
//       </div>
//     </a>
//   )
// }

function SourceLink({ url, title }: { url: string; title: string }) {
  return (
    <a href={url} target="_blank" rel="noopener noreferrer">
      <div className="text-black bg-white rounded-lg px-3 py-2">
        <div className="flex items-center gap-2">
          <span className="min-w-4 h-4 bg-red-800 rounded-full"></span>
          <div className="truncate">{title}</div>
          <MoveUpRight className="min-w-4 h-4 ml-1" />
        </div>
      </div>
    </a>
  )
}
