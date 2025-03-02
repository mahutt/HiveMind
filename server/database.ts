import pg from 'pg'
const { Client } = pg
const connectionString = process.env.PG_CONNECTION_STRING

const client = new Client({
  connectionString,
})
await client.connect()

const createVectorsTable = async () => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS vectors (
      id SERIAL PRIMARY KEY,
      text TEXT,
      vector VECTOR(1536),
      metadata JSONB
    );
  `
  try {
    await client.query(createTableQuery)
  } catch (err) {
    console.error('Error creating table:', err)
  }
}

const insertVector = async (text: string, vector: number[], metadata: any) => {
  const insertQuery = `
        INSERT INTO vectors (text, vector, metadata)
        VALUES ($1, $2, $3)
        RETURNING *;`
  const values = [text, JSON.stringify(vector), metadata]
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
      JSON.stringify(queryVector),
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
