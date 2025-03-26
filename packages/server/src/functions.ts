import {
  saveEmbedding,
  vectorSearch,
  newMessage,
  newSource,
} from './database.js'
import { getCompletion, getEmbedding } from './openai.js'
import fs from 'fs/promises'
import path from 'path'
import type { Chat, Citation } from 'models'

import { fileURLToPath } from 'url'
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const populateDatabase = async () => {
  try {
    const data = await fs.readFile(
      path.join(__dirname, '..', 'assets', 'sample-sources.json'),
      'utf8'
    )
    const programs = JSON.parse(data)

    for (const program of programs) {
      const source = await newSource(program.source.title, program.source.url)
      for (const chunk of program.chunks) {
        const embedding = await getEmbedding(chunk)
        const metadata = { doc: program.source.title }
        const savedEmbedding = await saveEmbedding(
          source.id,
          chunk,
          embedding,
          metadata
        )
        console.log(savedEmbedding)
      }
    }
  } catch (error) {
    console.error('Error reading or parsing chunks.json:', error)
  }
}

const answerWithRAG = async (
  chat: Chat,
  question: string
): Promise<{ response: string; snippet: Citation }> => {
  const savedMessage = await newMessage(chat.id, 'user', question)
  chat.messages.push(savedMessage)

  const query_embedding = await getEmbedding(question)
  const results = await vectorSearch(query_embedding)
  const contextEmbedding = results[0]
  const response = await getCompletion(chat.messages, contextEmbedding.text)
  return {
    response: response ?? '<No response generated>',
    snippet: contextEmbedding,
  }
}

// To populate the database, run the following:
// await populateDatabase()
// closeConnection()

// To answer a question with RAG, run the following:
// const chat = await newChat('Sample Chat')
// const { response, embedding } = await answerWithRAG(
//   chat,
//   'How long does the visual arts BFA take to complete?'
// )
// console.log(response)
// console.log(embedding)
// closeConnection()

export { populateDatabase, answerWithRAG }
