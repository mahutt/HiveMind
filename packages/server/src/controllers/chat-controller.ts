import type { Chat, Citation } from 'models'

import { getChat, newMessage, vectorSearch } from '../database'
import { getResponse, getEmbedding } from '../openai'

export const converse = async (
  message: string,
  chatId: number
): Promise<Chat | null> => {
  let chat: Chat | null = await getChat(Number(chatId))
  if (chat === null) return null

  const savedMessage = await newMessage(chat.id, 'user', message)
  chat.messages.push(savedMessage)

  const snippets: Citation[] = []

  let maxSearch = 5
  while (true) {
    console.info('Asking GPT')
    const choices = await getResponse(chat.messages, snippets, maxSearch > 0)
    const response = choices[0]
    if (
      response.type === 'function' &&
      response.name === 'file_search' &&
      response.arguments
    ) {
      console.info(`Performing file_search: ${response.arguments.query}`)
      const query_embedding = await getEmbedding(response.arguments.query)
      const results = await vectorSearch(
        query_embedding,
        snippets.map((s) => s.id)
      )
      snippets.push(...results)
      maxSearch--
    } else if (response.type === 'message' && response.content) {
      console.info('Received message from GPT')
      const savedMessage = await newMessage(
        chat.id,
        'assistant',
        response.content,
        snippets
      )
      chat.messages.push(savedMessage)
      break
    } else {
      throw new Error('Invalid response from OpenAI API')
    }
  }
  chat = await getChat(Number(chatId))
  return chat
}
