import { MoveUpRight } from 'lucide-react'

interface Source {
  id: string
  snippet: string
  url: string
}

const SAMPLE_SOURCES: Source[] = [
  {
    id: '1',
    snippet:
      'All students are responsible for following the course sequence laid out by their program department.',
    url: 'https://concordia.ca/calendar',
  },
  {
    id: '2',
    snippet:
      'Students requiring special accommodations should contact advisors once enrolled into a course.',
    url: 'https://concordia.ca/needs',
  },
]

export default function Sources() {
  return (
    <div className="h-full bg-gray-500 rounded-l-xl p-4 text-white space-y-4">
      <div>
        <h2 className="text-xl font-medium mb-3">Message Source(s)</h2>
        <div className="flex flex-col gap-2">
          {SAMPLE_SOURCES.map((source) => (
            <SourceCard key={source.id} source={source} />
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-medium mb-3">All Conversation Sources</h2>
        <div className="flex flex-col gap-2">
          <SourceLink url="https://concordia.ca/calendar" />
          <SourceLink url="https://concordia.ca/needs" />
        </div>
      </div>
    </div>
  )
}

function stripUrlProtocol(url: string) {
  return url.replace(/(^\w+:|^)\/\//, '')
}

function SourceCard({ source }: { source: Source }) {
  return (
    <a href={source.url} target="_blank" rel="noopener noreferrer">
      <div className="bg-gray-200 rounded-md p-4 text-gray-800">
        <p className="mb-4">
          <span className="italic">"{source.snippet}"</span>
        </p>

        <div className="flex justify-between items-center text-sm font-medium">
          <div className="flex items-center">
            <span className="w-4 h-4 bg-red-800 rounded-full mr-2"></span>
            {stripUrlProtocol(source.url)}
          </div>
          <MoveUpRight className="h-4 w-4 ml-1" />
        </div>
      </div>
    </a>
  )
}

function SourceLink({ url }: { url: string }) {
  return (
    <a href={url} target="_blank" rel="noopener noreferrer">
      <div className="bg-gray-200 text-gray-800 rounded-md p-4 flex justify-between items-center text-sm font-medium">
        <div className="flex items-center">
          <span className="w-4 h-4 bg-red-800 rounded-full mr-2"></span>
          {stripUrlProtocol(url)}
        </div>
        <MoveUpRight className="h-4 w-4 ml-1" />
      </div>
    </a>
  )
}
