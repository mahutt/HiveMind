import type { Chat, Citation, Message } from 'models'

import OpenAI from 'openai'
import type { ChatCompletionTool } from 'openai/resources/chat/completions.mjs'
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})
export default client

const formatMessage = (message: Message): string => {
  let baseMessage = ''
  if (message.citations) {
    baseMessage = `[Context you retrieved: ${message.citations
      .map((citation) => `${citation.text} (${citation.source.title})`)
      .join(', ')}]\n\n`
  }
  baseMessage += message.content
  return baseMessage
}

interface Response {
  type: 'message' | 'function'
  name?: string
  content?: string
  arguments?: {
    query: string
  }
}

export const getResponse = async (
  messages: Message[],
  snippets?: Citation[],
  allowFileSearch: boolean = true
): Promise<Response[]> => {
  const tools: ChatCompletionTool[] = allowFileSearch
    ? [
        {
          type: 'function',
          function: {
            name: 'file_search',
            description:
              'Searches for files in the Concordia University knowledge base',
            parameters: {
              type: 'object',
              properties: {
                query: {
                  type: 'string',
                  description:
                    'The query that will be embedded and used to search for files',
                },
              },
              required: ['query'],
            },
          },
        },
      ]
    : []

  const currentDateString = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const chatCompletion = await client.chat.completions.create({
    messages: [
      {
        role: 'system',
        content: `
            The current date is ${currentDateString}.
            You are a RAG AI assistant that answers questions about documents in your Concordia University knowledge base.
            This knowledge base includes information on program applications, student housing options, and course sequences.
            You are expected use the file_search tool, if it is available, which attempts to retrieve content by embedding the query paramater and then performing a similarity search.
            You must only use the facts from retrieved context to answer questions.
            If the relevant answer cannot be found in the context, ask the user for more information to improve your similarity search.
            If asked a question that is not in some way related to Concordia University, politely decline to answer.`,
      },
      ...messages.map((message) => ({
        role: message.role,
        content: formatMessage(message),
      })),
      {
        role: 'system',
        content: snippets
          ? `Here is context you previously retrieved: ${snippets
              .map((snippet) => `${snippet.text} (${snippet.source.title})`)
              .join(', ')}`
          : '',
      },
    ],
    model: 'gpt-4o-mini',
    tools: allowFileSearch ? tools : undefined,
  })

  let response: Response[] = []
  for (const choice of chatCompletion.choices) {
    if (choice.message.tool_calls) {
      for (const toolCall of choice.message.tool_calls) {
        response.push({
          type: 'function',
          name: toolCall.function.name,
          arguments: JSON.parse(toolCall.function.arguments),
        })
      }
    } else if (choice.message.content) {
      response.push({
        type: 'message',
        content: choice.message.content,
      })
    }
  }
  return response
}

export const getEmbedding = async (input: string) => {
  const embedding = await client.embeddings.create({
    model: 'text-embedding-3-small',
    input,
    encoding_format: 'float',
  })
  return embedding.data[0].embedding
}

export const getNameForChat = async (chat: Chat): Promise<string | null> => {
  const messages = chat.messages.map((message) => ({
    role: message.role,
    content: message.content,
  }))

  const chatString = JSON.stringify(messages)

  const chatCompletion = await client.chat.completions.create({
    messages: [
      {
        role: 'system',
        content: `
                    You are an AI assistant that names chats based on their content.
                    Provide a concise and descriptive name for the chat based on the provided messages.`,
      },
      {
        role: 'user',
        content: `Here is the chat content: ${chatString}`,
      },
    ],
    model: 'gpt-4o-mini',
    tools: [
      {
        type: 'function',
        function: {
          name: 'setChatName',
          description: 'Sets the name of the chat',
          parameters: {
            type: 'object',
            properties: {
              name: {
                type: 'string',
                description: 'The name of the chat',
              },
            },
            required: ['name'],
          },
        },
      },
    ],
  })

  const toolCalls = chatCompletion.choices[0].message.tool_calls ?? []
  if (toolCalls.length === 0) {
    return null
  }
  const args = JSON.parse(toolCalls[0].function.arguments)
  return args.name
}
