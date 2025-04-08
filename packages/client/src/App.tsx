import { useSidebar } from './providers/sidebar-hook'
import SidebarContainer from './components/sidebar-container'
import ChatHistory from './components/chat-history'
import Chat from './components/chat'
import Sources from './components/sources'
import BlurLayer from './components/blur-layer'
import DisclaimerModal from './components/disclaimer-modal'

function App() {
  const { isChatHistoryOpen, isSourcesOpen } = useSidebar()
  return (
    <>
      <DisclaimerModal />
      <div className="relative flex flex-row h-screen">
        <SidebarContainer isOpen={isChatHistoryOpen} absolutePosition="left">
          <ChatHistory />
        </SidebarContainer>
        <div className="relative flex-1 h-full">
          <BlurLayer />
          <Chat />
        </div>
        <SidebarContainer isOpen={isSourcesOpen} absolutePosition="right">
          <Sources />
        </SidebarContainer>
      </div>
    </>
  )
}

export default App
