import { useContext } from 'react'
import { SidebarContext, SidebarState } from './sidebar-provider'

export const useSidebar = (): SidebarState => {
  const context = useContext(SidebarContext)
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider')
  }
  return context
}
