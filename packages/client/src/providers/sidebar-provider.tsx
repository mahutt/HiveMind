import React, { createContext, useState, ReactNode, useEffect } from 'react'

const SMALL_SCREEN_BREAKPOINT = 768

export interface SidebarState {
  isChatHistoryOpen: boolean
  isSourcesOpen: boolean
  toggleChatHistory: () => void
  toggleSources: () => void
  openChatHistory: () => void
  closeChatHistory: () => void
  openSources: () => void
  closeSources: () => void
  isSmallScreen: boolean
}

const SidebarContext = createContext<SidebarState | undefined>(undefined)

interface SidebarProviderProps {
  children: ReactNode
  initialChatHistoryState?: boolean
  initialSourcesState?: boolean
}

export const SidebarProvider: React.FC<SidebarProviderProps> = ({
  children,
  initialChatHistoryState = false,
  initialSourcesState = false,
}) => {
  const [isChatHistoryOpen, setIsChatHistoryOpen] = useState<boolean>(
    initialChatHistoryState
  )
  const [isSourcesOpen, setIsSourcesOpen] =
    useState<boolean>(initialSourcesState)
  const [isSmallScreen, setIsSmallScreen] = useState<boolean>(
    typeof window !== 'undefined'
      ? window.innerWidth < SMALL_SCREEN_BREAKPOINT
      : false
  )

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < SMALL_SCREEN_BREAKPOINT)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const toggleChatHistory = () => {
    setIsChatHistoryOpen((prev) => {
      const willOpen = !prev
      if (isSmallScreen && willOpen) {
        setIsSourcesOpen(false)
      }
      return willOpen
    })
  }

  const toggleSources = () => {
    setIsSourcesOpen((prev) => {
      const willOpen = !prev
      if (isSmallScreen && willOpen) {
        setIsChatHistoryOpen(false)
      }
      return willOpen
    })
  }

  const openChatHistory = () => {
    if (isSmallScreen) {
      setIsSourcesOpen(false)
    }
    setIsChatHistoryOpen(true)
  }

  const openSources = () => {
    if (isSmallScreen) {
      setIsChatHistoryOpen(false)
    }
    setIsSourcesOpen(true)
  }

  const closeChatHistory = () => setIsChatHistoryOpen(false)
  const closeSources = () => setIsSourcesOpen(false)

  const value: SidebarState = {
    isChatHistoryOpen,
    isSourcesOpen,
    toggleChatHistory,
    toggleSources,
    openChatHistory,
    closeChatHistory,
    openSources,
    closeSources,
    isSmallScreen,
  }

  return (
    <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
  )
}

export { SidebarContext }
