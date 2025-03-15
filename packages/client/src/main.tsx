import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { SidebarProvider } from './providers/sidebar-provider.tsx'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SidebarProvider>
      <App />
    </SidebarProvider>
  </StrictMode>
)
