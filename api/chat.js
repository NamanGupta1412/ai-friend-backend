// api/chat.js
import 'dotenv/config';
const express = require('express');
const cors = require('cors');
const { Pinecone } = require('@pinecone-database/pinecone');
const { GoogleGenerativeAIEmbeddings } = require('@langchain/google-genai');
const { PineconeStore } = require('@langchain/pinecone');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
app.use(express.json());
app.use(cors());

const pinecone = new Pinecone();
const pineconeIndex = pinecone.Index('ai-friend-memory');
const embeddings = new GoogleGenerativeAIEmbeddings({ model: 'text-embedding-004' });
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const generativeModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;
    const vectorStore = await PineconeStore.fromExistingIndex(embeddings, { pineconeIndex });
    const results = await vectorStore.similaritySearch(message, 2);
    const context = results.map(r => r.pageContent).join('\n');

    const prompt = `You are my personal AI friend. Use the following context about me to answer my question.
      Context:
      ${context}
      My Question:
      ${message}`;

    const result = await generativeModel.generateContent(prompt);
    const response = await result.response;
    res.json({ response: response.text() });
  } catch (error) {
    console.error('Error in chat processing:', error);
    res.status(500).json({ error: 'Failed to process chat message' });
  }
});

module.exports = app;