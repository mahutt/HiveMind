import { useSidebar } from '../providers/sidebar-hook'

export default function ChatHistory() {
  const { toggleChatHistory } = useSidebar()
  return (
    <div className="h-full bg-blue-200">
      <button onClick={toggleChatHistory}>Toggle Chat History</button>
    </div>
  )
}
