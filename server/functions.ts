import { insertVector, vectorSearch } from './database.js'
import { getCompletion, getEmbedding } from './openai.js'
import fs from 'fs/promises'
import path from 'path'

import { fileURLToPath } from 'url'
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const populateDatabase = async () => {
  try {
    const data = await fs.readFile(
      path.join(__dirname, '..', 'assets', 'hayao-miyazaki-chunks.json'),
      'utf8'
    )
    const chunks = JSON.parse(data)
    for (let i = 0; i < chunks.length; i++) {
      const text = chunks[i]
      const vector = await getEmbedding(text)
      const metadata = { doc: 'Hayao_Miyazaki', index: i }
      await insertVector(text, vector, metadata)
      console.log(`Embedded and inserted chunk ${i} into the database`)
    }
  } catch (error) {
    console.error('Error reading or parsing chunks.json:', error)
  }
}

const answerWithRAG = async (
  question: string
): Promise<{ response: string; context: string }> => {
  const query_embedding = await getEmbedding(question)
  const results = await vectorSearch(query_embedding)
  const top_result = results[0]
  const RAG_PROMPT = ` 
    Use the following pieces of context to answer the user question.
    You must only use the facts from the context to answer.
    If the answer cannot be found in the context, say that you don't have enough information to answer the question and provide any relevant facts found in the context.

    Context:
    ${top_result.text}

    User Question:
    ${question}
  `
  const response = await getCompletion(RAG_PROMPT)
  return {
    response: response ?? '<No response generated>',
    context: top_result.text,
  }
}

export { populateDatabase, answerWithRAG }
