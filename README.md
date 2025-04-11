# HiveMind Setup Instructions

Start by cloning this repository, and then follow the steps below.

## Bun

1. Install Bun by running one of the following commands:

```
curl -fsSL https://bun.sh/install | bash # macOS, Linux, or WSL
```

```
powershell -c "irm bun.sh/install.ps1|iex" # Windows
```

Before cloning, installing dependencies, and running the app, we must ensure that a PostgreSQL database called `rag_db` is set up locally, and that environment variables are properly set.

## PostgreSQL

(On MacOS, assuming Brew is installed)

1. Run the following commands to install & run the Postgres service:
```
brew install postgresql # install PostgreSQL
brew install pgvector
brew services start postgresql # start the PostgreSQL service
```

2. Create the `rag_db` PostgreSQL database by entering the interactive shell:
```
psql postgres
CREATE DATABASE rag_db;
\q
```

3. Connect to this new database and enable the `pgvector` extension within it:
```
psql rag_db
CREATE EXTENSION vector;
\q
```

4. Add the following key-value pair to an `.env` located at `packages/server/.env`:
```
PG_CONNECTION_STRING=postgresql+asyncpg://localhost:5432/rag_db
```

## OpenAI

1. Retrieve an API key from the [OpenAI developer platform](http://platform.openai.com/).
2. Insert your key into the repo's backend `.env` file located at `packages/server/.env` as follows:
```
OPENAI_API_KEY=<your-key-here>
```

> ⚠️ Please make sure you have sufficient funds in your OpenAI account.

## Installing Dependencies

1. Navigate to the cloned repository

2. At the root of the repository, run the following commands
```
bun install
```

3. To populate the database with some basic amount of data for testing purposes, navigate to `packages/server/` and run `bun src/functions.ts`.
4. Once the data population procedure is complete, run `bun run dev` (again in the `packages/server/` directory).
5. In a separate terminal, navigate to `packages/client/` and run `bun run dev`.
6. You can now access the application in your browser at `http://localhost:5173/`.

