import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { ChatProvider } from './providers/chat-provider.tsx'
import { SidebarProvider } from './providers/sidebar-provider.tsx'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ChatProvider>
      <SidebarProvider>
        <App />
      </SidebarProvider>
    </ChatProvider>
  </StrictMode>
)
