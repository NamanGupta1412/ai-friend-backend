// feed-memory.js
require('dotenv').config();
const { Pinecone } = require('@pinecone-database/pinecone');
const { GoogleGenerativeAIEmbeddings } = require('@langchain/google-genai');
const { PineconeStore } = require('@langchain/pinecone');


// --- Your Personal Data/Memories ---
const memories = [
  "My name is Naman and I am learning UI/UX design.",
  "I live in the city of Jaipur.",
  "I like to play valorant in my free time",
  "My goal is to build a personalized AI companion.",
];

async function feedMemory() {
  const pinecone = new Pinecone();
  // Remember to create this index in the Pinecone dashboard first!
  // Use 768 dimensions.
  const pineconeIndex = pinecone.Index('ai-friend-memory'); 
  const embeddings = new GoogleGenerativeAIEmbeddings({ model: 'text-embedding-004' });

  console.log('--- Feeding memories to Pinecone. This may take a moment... ---');
  await PineconeStore.fromTexts(memories, {}, embeddings, { pineconeIndex });
  console.log('✅ Memory feed complete!');
}

feedMemory();