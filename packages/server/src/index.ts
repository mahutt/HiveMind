import 'dotenv/config'
import figlet from 'figlet'
import { createChat, getChat, newMessage } from './database'
import { answerWithRAG } from './functions'
import type { Chat } from 'models'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

const server = Bun.serve({
  port: 3000,
  routes: {
    '/api': {
      OPTIONS: () => new Response(null, { headers: corsHeaders }),
      POST: async (req) => {
        const chat: Chat = await createChat()
        return Response.json(chat, {
          headers: corsHeaders,
        })
      },
    },
    '/api/:chatId': {
      OPTIONS: () => new Response(null, { headers: corsHeaders }),
      GET: async (req) => {
        const { chatId } = req.params
        const chat = await getChat(Number(chatId))
        return Response.json(chat, {
          headers: corsHeaders,
        })
      },
      POST: async (req) => {
        const { chatId } = req.params
        const { message: userMessage } = await req.json()

        let chat: Chat | null = await getChat(Number(chatId))
        if (chat === null)
          return new Response('Chat not found', { status: 404 })

        const { response, snippet } = await answerWithRAG(chat, userMessage)
        await newMessage(Number(chatId), 'assistant', response, [snippet])
        chat = await getChat(Number(chatId))
        return Response.json(chat, {
          headers: corsHeaders,
        })
      },
    },
  },
  fetch(req) {
    const body = figlet.textSync('HiveMind')
    return new Response(body)
  },
})

console.log(`Listening on http://localhost:${server.port} ...`)
