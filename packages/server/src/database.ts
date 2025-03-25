import type { Chat, Message } from 'models'
import pg from 'pg'
const { Client } = pg
const connectionString = process.env.PG_CONNECTION_STRING

const client = new Client({
  connectionString,
})
await client.connect()

await (async () => {
  const ddl = `
        CREATE TABLE IF NOT EXISTS chat (
            id SERIAL PRIMARY KEY,
            title TEXT
        );
        CREATE TABLE IF NOT EXISTS message (
            id SERIAL PRIMARY KEY,
            chat_id INTEGER REFERENCES chat(id),
            role TEXT,
            content TEXT,
            timestamp BIGINT
        );
    `
  await client.query(ddl)
})()

export const createChat = async (title: string = 'New Chat'): Promise<Chat> => {
  const query = `
        INSERT INTO chat (title)
        VALUES ($1)
        RETURNING *;
    `
  const result = await client.query(query, [title])

  const chat: Chat = {
    ...result.rows[0],
    messages: [],
  }
  return chat
}

export const getChat = async (chatId: number): Promise<Chat | null> => {
  const query = `SELECT * FROM chat WHERE id = $1;`
  const result = await client.query(query, [chatId])
  const chat = result.rows[0]
  if (!chat) return null
  return {
    ...chat,
    messages: await getMessages(chatId),
  }
}

export const getMessages = async (chatId: number): Promise<Message[]> => {
  const query = `SELECT * FROM message WHERE chat_id = $1;`
  const result = await client.query(query, [chatId])
  const messages = result.rows.map((row) => ({
    id: row.id,
    role: row.role,
    content: row.content,
    timestamp: Number(row.timestamp),
  }))
  return messages
}

export const createMessage = async (
  chatId: number,
  role: 'user' | 'assistant',
  content: string,
  timestamp: number
): Promise<Message | null> => {
  const query = `
        INSERT INTO message (chat_id, role, content, timestamp)
        VALUES ($1, $2, $3, $4)
        RETURNING *;
    `
  try {
    const result = await client.query(query, [chatId, role, content, timestamp])
    return {
      id: result.rows[0].id,
      role,
      content,
      timestamp,
    }
  } catch {
    return null
  }
}

export const addMessage = async (
  chatId: number,
  content: string,
  role: 'user' | 'assistant'
): Promise<Chat | null> => {
  const chat = await createMessage(chatId, role, content, Date.now())
  return await getChat(chatId)
}

export const createVectorsTable = async (): Promise<boolean> => {
  const checkTableQuery = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'vectors'
      );`

  const tableExists = await client.query(checkTableQuery)
  if (tableExists.rows[0].exists) return false

  const createTableQuery = `
      CREATE TABLE vectors (
        id SERIAL PRIMARY KEY,
        text TEXT,
        vector VECTOR(1536),
        metadata JSONB
      );`

  await client.query(createTableQuery)
  console.info('Table "vectors" successfully created.')
  return true
}

export const insertVector = async (
  text: string,
  vector: number[],
  metadata: any
) => {
  const insertQuery = `
        INSERT INTO vectors (text, vector, metadata)
        VALUES ($1, $2, $3)
        RETURNING *;`
  const values = [text, `[${vector.join(',')}]`, metadata]
  try {
    await client.query(insertQuery, values)
  } catch (error) {
    console.error('Error inserting row:', error)
  }
}

export const vectorSearch = async (queryVector: number[], topK = 3) => {
  const searchQuery = `
      SELECT 
        text,
        metadata,
        1 - (vector <=> $1) as score
      FROM vectors
      ORDER BY score DESC
      LIMIT $2;
    `
  try {
    const result = await client.query(searchQuery, [
      `[${queryVector.join(',')}]`,
      topK,
    ])
    return result.rows.map((row) => ({
      text: row.text,
      metadata: row.metadata,
      score: row.score,
    }))
  } catch (error) {
    console.error('Error performing vector search:', error)
    return []
  }
}

const closeConnection = async () => {
  await client.end()
}
