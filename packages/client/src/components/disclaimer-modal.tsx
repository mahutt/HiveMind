import { useChat } from '@/providers/chat-hook'
import { useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from './ui/card'
import { Button } from './ui/button'
import { Sparkles } from 'lucide-react'

export default function DisclaimerModal() {
  const { chatHistory } = useChat()
  const [disclaimerDismissed, setDisclaimerDismissed] = useState(false)
  if (chatHistory.length > 0 || disclaimerDismissed) return null
  return (
    <div className="fixed inset-0 backdrop-blur-sm z-30">
      <div className="relative w-full h-full flex items-center justify-center">
        <Card className="w-[350px]">
          <CardHeader>
            <CardTitle>Hi there!</CardTitle>
            <CardDescription>
              Welcome to HiveMind, a chatbot for new and prospective
              Concordians. The more details in your prompt, the more tailored
              your experience will be.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              We don't do anything with user data, see our privacy policy{' '}
              <a href="/#" className="underline">
                here
              </a>
              .
            </p>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button
              className="bg-conu hover:bg-conu/80 text-white"
              onClick={() => {
                setDisclaimerDismissed(true)
              }}
            >
              Start using HiveMind
              <Sparkles />
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
