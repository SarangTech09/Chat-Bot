# ChatBot 🤖

A full-stack AI chatbot application with a modern UI and persistent chat history. Built using Next.js for the frontend, Node.js + Express for the backend, PostgreSQL for storage, and integrates with a locally running Ollama LLM (Gemma 2B).

---

## 🚀 Tech Stack

- **Frontend**: [Next.js](https://nextjs.org/) (React framework)
- **Backend**: [Node.js](https://nodejs.org/) with [Express.js](https://expressjs.com/)
- **Database**: [PostgreSQL](https://www.postgresql.org/)
- **LLM**: [Ollama (Gemma 2B)](https://ollama.com/)
- **API Integration**: Ollama runs locally at `http://localhost:11434/api/chat`

---

## ⚙️ Setup Instructions

### 1. 🧠 LLM: Ollama

Ensure you have [Ollama](https://ollama.com/) installed locally.

```bash
# Install Ollama (if not already)
curl -fsSL https://ollama.com/install.sh | sh

# Run the Gemma 2B model
ollama run gemma:2b

```
### 2. 🗄️ PostgreSQL Database

## Ensure PostgreSQL is installed and running. Then create a database:

## Run the necessary migration or schema setup:

## Update your .env file with DB credentials:

### 3. 🛠️ Backend Setup
```bash
cd backend
npm install
npm run dev
```
## Ensure the backend connects to both the DB and Ollama API.

### 4. 🖥️ Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## 💡 Features

- 🧭 **Sidebar**: New Chat button + list of past sessions (date-based titles)
- 💬 **Chat UI**: Two-pane layout (sidebar + chat window)
- 🧠 **LLM Integration**: Gemma 2B via local Ollama server
- 📥 **Input Box**: Message input at bottom with "Send" button
- 🔄 **Streaming Output**: Assistant messages appear in real-time
- 💾 **Persistent Chat History**: Stored in PostgreSQL with chat sessions + messages

---

## 📌 Assumptions & Constraints

- Ollama with Gemma 2B must be running locally on `localhost:11434`
- No cloud-hosted LLM integration; designed for local development
- Only supports one active user session per instance (no auth/multi-user yet)
- No external storage used — all data is stored in local PostgreSQL

## 📬 Feedback or Contributions
- PRs and suggestions welcome! Built with ❤️ by Sarang Tadaskar.