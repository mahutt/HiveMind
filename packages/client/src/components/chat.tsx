import { useSidebar } from '../providers/sidebar-hook'

export default function Chat() {
  const { toggleChatHistory, toggleSources } = useSidebar()
  return (
    <div className="flex flex-col h-full bg-red-200">
      <button onClick={toggleChatHistory}>Toggle Chat History</button>
      <button onClick={toggleSources}>Toggle Sources</button>
    </div>
  )
}
