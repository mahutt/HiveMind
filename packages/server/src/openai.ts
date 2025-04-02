import type { Chat, Message } from 'models'

import OpenAI from 'openai'
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})
export default client

export const getCompletion = async (messages: Message[], context: string) => {
  const chatCompletion = await client.chat.completions.create({
    messages: [
      {
        role: 'system',
        content: `
            You are an AI assistant that answers questions about documents in your knowledge base.
            Use the following pieces of context to answer the user question.
            You must only use the facts from the context to answer.
            If the answer cannot be found in the context, say that you don't have enough information to answer the question and provide any relevant facts found.`,
      },
      ...messages.map((message) => ({
        role: message.role,
        content: message.content,
      })),
      {
        role: 'system',
        content: `Retrieved context: ${context}`,
      },
    ],
    model: 'gpt-4o-mini',
  })
  return chatCompletion.choices[0].message.content
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
