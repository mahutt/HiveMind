import OpenAI from 'openai'

const SYSTEM_PROMPT = `You are an AI assistant that answers questions about documents in your knowledge base.`

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const getCompletion = async (content: string) => {
  const chatCompletion = await client.chat.completions.create({
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content },
    ],
    model: 'gpt-4o-mini',
  })
  return chatCompletion.choices[0].message.content
}

const getEmbedding = async (input: string) => {
  const embedding = await client.embeddings.create({
    model: 'text-embedding-3-small',
    input,
    encoding_format: 'float',
  })
  return embedding.data[0].embedding
}

export { getCompletion, getEmbedding }
