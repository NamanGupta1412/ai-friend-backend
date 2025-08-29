// api/chat.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pinecone } = require('@pinecone-database/pinecone');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
app.use(express.json());
app.use(cors());

const pinecone = new Pinecone();
const pineconeIndex = pinecone.Index('ai-friend-memory');
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const embeddingModel = genAI.getGenerativeModel({ model: 'text-embedding-004' });
const generativeModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;
    const embeddingResult = await embeddingModel.embedContent(message);
    const embedding = embeddingResult.embedding.values;
    const queryResponse = await pineconeIndex.query({
      topK: 2,
      vector: embedding,
      includeMetadata: true,
    });
    const context = queryResponse.matches.map((match) => match.metadata.text).join('\n');
    const prompt = `You are my personal AI friend from Jaipur. Use the following context about me to answer my question.
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