import { useSidebar } from '@/providers/sidebar-hook'

export default function BlurLayer() {
  const {
    isChatHistoryOpen,
    isSourcesOpen,
    isSmallScreen,
    closeChatHistory,
    closeSources,
  } = useSidebar()

  if (!isSmallScreen || (!isChatHistoryOpen && !isSourcesOpen)) {
    return null
  }

  return (
    <div
      className="absolute inset-0 backdrop-blur-[2px]"
      onClick={() => {
        if (isChatHistoryOpen) {
          closeChatHistory()
        } else if (isSourcesOpen) {
          closeSources()
        }
      }}
    />
  )
}
