import { TrendingUp } from 'lucide-react'

const TRENDING_PROMPTS = [
  'How do I build my course schedule?',
  'How can I make friends on campus?',
  'What is the deadline to add and drop classes?',
]

export default function TrendingPrompts({
  callback,
  visible = true,
}: {
  callback: (prompt: string) => void
  visible?: boolean
}) {
  return (
    <div
      className={`flex flex-col w-full max-w-xl mx-auto px-4 overflow-hidden animate-all duration-300 ease-in-out ${
        visible ? 'h-[170px] opacity-100' : 'h-0 opacity-0'
      }`}
    >
      {TRENDING_PROMPTS.map((prompt, index) => (
        <div key={index} onClick={() => callback(prompt)}>
          <TrendingPrompt prompt={prompt} />
          {index !== TRENDING_PROMPTS.length - 1 && <Separator />}
        </div>
      ))}
    </div>
  )
}

function TrendingPrompt({ prompt }: { prompt: string }) {
  return (
    <div className="cursor-pointer flex items-center gap-4 rounded-lg text-gray-500 hover:text-black hover:bg-gray-50 p-4">
      <TrendingUp className="" strokeWidth={1.5} />
      <p>{prompt}</p>
    </div>
  )
}

function Separator() {
  return <div className="h-[1px] bg-gray-200 w-full" />
}
