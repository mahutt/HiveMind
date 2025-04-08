import * as React from 'react'
import { Languages } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const languages = [
  {
    value: 'english',
    label: 'English',
  },
  {
    value: 'french',
    label: 'Français',
  },
]

export function LanguageSelector() {
  const [value, setValue] = React.useState('english')

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-full justify-between">
          {value
            ? languages.find((language) => language.value === value)?.label
            : 'Select Language...'}
          <Languages className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-68">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.value}
            onClick={() => setValue(language.value)}
            className={`w-full ${
              value === language.value ? 'bg-accent text-muted-foreground' : ''
            }`}
          >
            {language.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
