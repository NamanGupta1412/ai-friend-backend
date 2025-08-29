// feed-memory.js
require('dotenv').config();
const { Pinecone } = require('@pinecone-database/pinecone');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const memories = [
  "My name is Naman.",
  "I live in Jaipur, Rajasthan.",
  "I am building a personal AI friend.",
  "I like to play valorant in my free time",
];

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const embeddingModel = genAI.getGenerativeModel({ model: 'text-embedding-004' });

async function feedMemory() {
  const pinecone = new Pinecone();
  const pineconeIndex = pinecone.Index('ai-friend-memory');
  console.log('--- Creating embeddings and feeding memories to Pinecone. ---');

  for (const memory of memories) {
    const embeddingResult = await embeddingModel.embedContent(memory);
    const embedding = embeddingResult.embedding.values;
    const uniqueId = `memory-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    await pineconeIndex.upsert([{
      id: uniqueId,
      values: embedding,
      metadata: { text: memory },
    }]);
  }
  console.log('✅ Memory feed complete!');
}

feedMemory();