require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const axios = require('axios');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database configuration
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'chatbot',
  password: process.env.DB_PASSWORD || 'yourpassword',
  port: process.env.DB_PORT || 5432,
});

// Test database connection
pool.query('SELECT NOW()', (err) => {
  if (err) {
    console.error('❌ Database connection error:', err.message);
  } else {
    console.log('✅ Database connected successfully');
  }
});

// Middleware to log requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// GET all chats for sidebar
app.get('/api/chats', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, title, created_at FROM chats ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (err) {
    console.error('Error fetching chats:', err);
    res.status(500).json({ error: 'Failed to fetch chat history' });
  }
});

// Create new chat with automatic title from first message
app.post('/api/chat', async (req, res) => {
  try {
    const { firstMessage } = req.body;
    // Generate title from first message or use default
    const title = firstMessage 
      ? firstMessage.substring(0, 50) 
      : 'New Chat';
    
    const { rows } = await pool.query(
      'INSERT INTO chats (title) VALUES ($1) RETURNING *',
      [title]
    );

    // If there's a first message, save it immediately
    if (firstMessage) {
      await pool.query(
        'INSERT INTO messages (chat_id, role, content) VALUES ($1, $2, $3)',
        [rows[0].id, 'user', firstMessage]
      );
    }

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Error creating chat:', err);
    res.status(500).json({ 
      error: 'Failed to create new chat',
      details: err.message 
    });
  }
});

// Get full message history for a chat
app.get('/api/chat/:chatId', async (req, res) => {
  try {
    const { chatId } = req.params;
    const { rows } = await pool.query(
      `SELECT id, role, content, created_at 
       FROM messages 
       WHERE chat_id = $1 
       ORDER BY created_at ASC`,
      [chatId]
    );
    res.json(rows);
  } catch (err) {
    console.error('Error fetching messages:', err);
    res.status(500).json({ 
      error: 'Failed to fetch messages',
      details: err.message 
    });
  }
});

// Handle chat messages and streaming responses
app.post('/api/chat/:chatId/message', async (req, res) => {
  const { chatId } = req.params;
  const { content } = req.body;

  if (!content) {
    return res.status(400).json({ error: 'Message content is required' });
  }

  try {
    // 1. Save user message to database
    await pool.query(
      'INSERT INTO messages (chat_id, role, content) VALUES ($1, $2, $3)',
      [chatId, 'user', content]
    );

    // 2. Get response from Ollama
    const ollamaResponse = await axios.post(
      'http://localhost:11434/api/chat',
      {
        model: 'gemma:2b',
        messages: [{ role: 'user', content }],
        stream: true,
      },
      { 
        responseType: 'stream',
        timeout: 60000 // 60 second timeout
      }
    );

    // 3. Set up streaming response
    res.setHeader('Content-Type', 'text/event-stream');
    let fullResponse = '';

    ollamaResponse.data.on('data', chunk => {
      try {
        const data = JSON.parse(chunk.toString());
        if (data.message?.content) {
          fullResponse += data.message.content;
          // Stream each token to the client
          res.write(`data: ${JSON.stringify({ content: data.message.content })}\n\n`);
        }
      } catch (e) {
        console.error('Error parsing stream chunk:', e);
      }
    });

    ollamaResponse.data.on('end', async () => {
      try {
        // 4. Save complete assistant message
        await pool.query(
          'INSERT INTO messages (chat_id, role, content) VALUES ($1, $2, $3)',
          [chatId, 'assistant', fullResponse]
        );
        res.end();
      } catch (dbError) {
        console.error('Error saving assistant message:', dbError);
        res.end();
      }
    });

    ollamaResponse.data.on('error', err => {
      console.error('Ollama stream error:', err);
      res.status(500).end();
    });

  } catch (err) {
    console.error('Error processing message:', err);
    res.status(500).json({ 
      error: 'Failed to process message',
      details: err.message 
    });
  }
});

// Update chat title
app.patch('/api/chat/:chatId', async (req, res) => {
  const { chatId } = req.params;
  const { title } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }

  try {
    const { rows } = await pool.query(
      'UPDATE chats SET title = $1 WHERE id = $2 RETURNING *',
      [title, chatId]
    );
    res.json(rows[0]);
  } catch (err) {
    console.error('Error updating chat title:', err);
    res.status(500).json({ 
      error: 'Failed to update chat title',
      details: err.message 
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    details: err.message 
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});