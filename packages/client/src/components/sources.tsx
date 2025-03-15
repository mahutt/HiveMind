import { useSidebar } from '../providers/sidebar-hook'

export default function Sources() {
  const { toggleSources } = useSidebar()
  return (
    <div className="h-full bg-green-200">
      <button onClick={toggleSources}>Toggle Sources</button>
    </div>
  )
}
