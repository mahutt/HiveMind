import { HTMLAttributes } from 'react'

interface SidebarContainerProps extends HTMLAttributes<HTMLDivElement> {
  isOpen: boolean
  absolutePosition?: 'left' | 'right'
}

export default function SidebarContainer({ ...props }: SidebarContainerProps) {
  const { isOpen, absolutePosition = 'left', children, ...rest } = props
  const position = absolutePosition === 'left' ? 'left-0' : 'right-0'
  return (
    <div
      className={`absolute ${position} z-20 inset-y-0 sm:relative overflow-hidden transition-all duration-200 ${
        isOpen ? 'w-[300px]' : 'w-0'
      }`}
      {...rest}
    >
      <div className="w-[300px] h-full">{children}</div>
    </div>
  )
}
