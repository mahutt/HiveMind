import 'dotenv/config'
import figlet from 'figlet'
import { addMessage, createChat, createVectorsTable, getChat } from './database'
import { answerWithRAG, populateDatabase } from './functions'
import { getCompletion } from './openai'
import type { Chat } from 'models'

const server = Bun.serve({
  port: 3000,
  routes: {
    '/setup': {
      POST: async () => {
        await createVectorsTable()
        await populateDatabase()
        return new Response('Database created and populated')
      },
    },
    '/query': {
      POST: async (req) => {
        const { query } = await req.json()
        const { response, context } = await answerWithRAG(query)
        return Response.json({ response, context })
      },
    },
    '/api': {
      POST: async (req) => {
        const { message } = await req.json()
        let chat: Chat | null = await createChat(message, 'user')
        const assitantMessage =
          (await getCompletion(chat.messages)) ??
          '<Failed to generate response>'
        chat = await addMessage(chat.id, assitantMessage, 'assistant')
        return Response.json(chat)
      },
    },
    '/api/:chatId': {
      GET: async (req) => {
        const { chatId } = req.params
        const chat = await getChat(Number(chatId))
        return Response.json(chat)
      },
      POST: async (req) => {
        const { chatId } = req.params
        const { message: userMessage } = await req.json()

        let chat = await addMessage(Number(chatId), userMessage, 'user')

        if (chat === null) {
          return new Response('Chat not found', { status: 404 })
        }

        const assitantMessage =
          (await getCompletion(chat.messages)) ??
          '<Failed to generate response>'
        chat = await addMessage(Number(chatId), assitantMessage, 'assistant')
        return Response.json(chat)
      },
    },
  },
  fetch(req) {
    const body = figlet.textSync('HiveMind')
    return new Response(body)
  },
})

console.log(`Listening on http://localhost:${server.port} ...`)
