import pg from 'pg'
const { Client } = pg
const connectionString = process.env.PG_CONNECTION_STRING

const client = new Client({
  connectionString,
})
await client.connect()

const createVectorsTable = async (): Promise<boolean> => {
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

const insertVector = async (text: string, vector: number[], metadata: any) => {
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

const vectorSearch = async (queryVector: number[], topK = 3) => {
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

export { createVectorsTable, closeConnection, insertVector, vectorSearch }
