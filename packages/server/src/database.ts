import type { Chat, Citation, Message, Source } from 'models'
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
        CREATE TABLE IF NOT EXISTS source (
            id SERIAL PRIMARY KEY,
            title TEXT,
            url TEXT
        );
        CREATE TABLE IF NOT EXISTS embedding (
            id SERIAL PRIMARY KEY,
            source_id INTEGER REFERENCES source(id),
            text TEXT,
            embedding VECTOR(1536),
            metadata JSONB
        );
        CREATE TABLE IF NOT EXISTS message_embedding (
            message_id INTEGER REFERENCES message(id),
            embedding_id INTEGER REFERENCES embedding(id)
        );
        CREATE TABLE IF NOT EXISTS story_source (
            id SERIAL PRIMARY KEY,
            chat_id INTEGER REFERENCES chat(id),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            sources JSONB DEFAULT '{}' 
        );
    `
  await client.query(ddl)
})()

export const newSource = async (
  title: string,
  url: string
): Promise<Source> => {
  const query = `
        INSERT INTO source (title, url)
        VALUES ($1, $2)
        RETURNING *;
    `
  const result = await client.query(query, [title, url])
  return {
    id: result.rows[0].id,
    title: result.rows[0].title,
    url: result.rows[0].url,
  }
}

export const updateChatTitle = async (
  chatId: number,
  title: string
): Promise<Chat> => {
  const query = `
        UPDATE chat
        SET title = $2
        WHERE id = $1
        RETURNING *;
    `
  const result = await client.query(query, [chatId, title])
  return {
    id: result.rows[0].id,
    title: result.rows[0].title,
    messages: await getMessages(chatId),
  }
}

export const getSource = async (sourceId: number): Promise<Source> => {
  const query = `SELECT * FROM source WHERE id = $1;`
  const result = await client.query(query, [sourceId])
  const source = result.rows[0]
  if (!source) {
    throw new Error(`Source with id ${sourceId} not found`)
  }
  return source
}

export const saveEmbedding = async (
  sourceId: number,
  text: string,
  embedding: number[],
  metadata: any
): Promise<Citation> => {
  const query = `
        INSERT INTO embedding (source_id, text, embedding, metadata)
        VALUES ($1, $2, $3, $4)
        RETURNING *;
        `
  const result = await client.query(query, [
    sourceId,
    text,
    `[${embedding.join(',')}]`,
    metadata,
  ])
  return {
    id: result.rows[0].id,
    text: result.rows[0].text,
    source: await getSource(sourceId),
  }
}

export const newChat = async (title: string = 'New Chat'): Promise<Chat> => {
  const query = `
        INSERT INTO chat (title)
        VALUES ($1)
        RETURNING *;
    `
  const result = await client.query(query, [title])
  return {
    id: result.rows[0].id,
    title: result.rows[0].title,
    messages: [],
  }
}

export const newMessage = async (
  chatId: number,
  role: 'user' | 'assistant',
  content: string,
  snippets: Citation[] = [],
  timestamp: number = Date.now()
): Promise<Message> => {
  const query = `
        INSERT INTO message (chat_id, role, content, timestamp)
        VALUES ($1, $2, $3, $4)
        RETURNING *;
    `
  const result = await client.query(query, [chatId, role, content, timestamp])
  for (const snippet of snippets) {
    const query = `
                INSERT INTO message_embedding (message_id, embedding_id)
                VALUES ($1, $2);
            `
    await client.query(query, [result.rows[0].id, snippet.id])
  }
  return {
    id: result.rows[0].id,
    role,
    content,
    timestamp,
  }
}

export const getChat = async (chatId: number): Promise<Chat> => {
  const query = `SELECT * FROM chat WHERE id = $1;`
  const result = await client.query(query, [chatId])
  const chat = result.rows[0]
  if (!chat) {
    throw new Error(`Chat with id ${chatId} not found`)
  }
  return {
    ...chat,
    messages: await getMessages(chatId),
  }
}

export const getEmbedding = async (embeddingId: number): Promise<Citation> => {
  const query = `SELECT * FROM embedding WHERE id = $1;`
  const result = await client.query(query, [embeddingId])
  const embedding = result.rows[0]
  if (!embedding) {
    throw new Error(`Embedding with id ${embeddingId} not found`)
  }
  return {
    id: embedding.id,
    text: embedding.text,
    source: await getSource(embedding.source_id),
  }
}

// new wave ^^^

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

export const getMessages = async (chatId: number): Promise<Message[]> => {
  const query = `SELECT * FROM message WHERE chat_id = $1 ORDER BY timestamp ASC;`
  const result = await client.query(query, [chatId])
  const messages: Message[] = []
  const indexedSources: { [sourceId: number]: number } = {};

  for (const row of result.rows) {
    const message: Message = {
      id: row.id,
      role: row.role,
      content: row.content,
      timestamp: Number(row.timestamp),
      citations: [],
    }
     const embeddingsQuery = `
      SELECT 
        embedding.id, 
        embedding.text, 
        source.id as source_id,
        source.title,
        source.url
      FROM embedding 
      JOIN source ON embedding.source_id = source.id
      JOIN message_embedding ON embedding.id = message_embedding.embedding_id
      WHERE message_embedding.message_id = $1;
    `
    const embeddingsResult = await client.query(embeddingsQuery, [row.id])

    message.citations = embeddingsResult.rows.map(embRow => {
      // Assign index if not already indexed
      if (!(embRow.source_id in indexedSources)) {
        indexedSources[embRow.source_id] = Object.keys(indexedSources).length + 1;
      }

      return {
        id: embRow.id,
        text: embRow.text,
        source: {
          id: embRow.source_id,
          title: embRow.title,
          url: embRow.url,
          index: indexedSources[embRow.source_id]
        }
      };
    });

    messages.push(message)
  }

  return messages
}

export const vectorSearch = async (
  queryVector: number[],
  excludeIds: number[] = [],
  topK = 3
): Promise<Citation[]> => {
  const searchQuery = `
      SELECT 
        id,
        source_id,
        text,
        metadata,
        1 - (embedding <=> $1) as score
      FROM embedding
      WHERE id != ALL($3::int[])
      ORDER BY score DESC
      LIMIT $2;
    `
  try {
    const result = await client.query(searchQuery, [
      `[${queryVector.join(',')}]`,
      topK,
      excludeIds,
    ])
    const embeddings: Citation[] = []
    for (const row of result.rows) {
      embeddings.push({
        id: row.id,
        text: row.text,
        source: await getSource(row.source_id),
      })
    }
    return embeddings
  } catch (error) {
    console.error('Error performing vector search:', error)
    return []
  }
}
export const closeConnection = async () => {
  await client.end()
}

export const createStorySource = async (chatId: number): Promise<void> => {
  // Alter the source table to add chat_index column if not exists
  const query = `
    ALTER TABLE source 
    ADD COLUMN IF NOT EXISTS chat_index INTEGER;
  `;
  await client.query(query);

  // Reset indices for sources in this chat
  const resetQuery = `
    UPDATE source 
    SET chat_index = NULL 
    WHERE id IN (
      SELECT DISTINCT source_id 
      FROM embedding 
      JOIN message_embedding ON embedding.id = message_embedding.embedding_id 
      JOIN message ON message_embedding.message_id = message.id 
      WHERE message.chat_id = $1
    );
  `;
  await client.query(resetQuery, [chatId]);
};
