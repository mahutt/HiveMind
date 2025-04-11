import { saveEmbedding, newSource, closeConnection } from './database.js'
import { getEmbedding } from './openai.js'
import fs from 'fs/promises'
import path from 'path'

import { fileURLToPath } from 'url'
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const populateDatabase = async () => {
  try {
    const data = await fs.readFile(
      path.join(__dirname, '..', 'assets', 'chunks.json'),
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

// To populate the database, run the following:
await populateDatabase()
closeConnection()
