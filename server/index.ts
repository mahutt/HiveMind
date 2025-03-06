import 'dotenv/config'
import figlet from 'figlet'
import { createVectorsTable } from './database'
import { answerWithRAG, populateDatabase } from './functions'

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
  },
  fetch(req) {
    const body = figlet.textSync('HiveMind')
    return new Response(body)
  },
})

console.log(`Listening on http://localhost:${server.port} ...`)
