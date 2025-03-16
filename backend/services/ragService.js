// backend/services/ragService.js
// This service handles the Retrieval-Augmented Generation vector search

// Note: In a real implementation, you would connect to a vector database
// like Pinecone, Weaviate, or use OpenAI embeddings with your own storage

// Sample documents for demonstration (in a real app, these would be in a vector DB)
const sampleVectorData = [
    {
      id: 'doc1',
      content: 'Our service department is open Monday through Friday from 8am to 6pm, and Saturday from 9am to 3pm. Service appointments can be scheduled through our online portal or by calling our service desk at 555-123-4567.',
      metadata: {
        category: 'service',
        keywords: ['service hours', 'appointments', 'schedule']
      }
    },
    {
      id: 'doc2',
      content: 'Test drives can be booked for any vehicle in our inventory. Each test drive typically lasts 30 minutes and requires a valid driver\'s license. Weekend test drives are by appointment only.',
      metadata: {
        category: 'sales',
        keywords: ['test drive', 'appointment', 'license']
      }
    },
    {
      id: 'doc3',
      content: 'Our roadside assistance is available 24/7 by calling 555-HELP-NOW. Service is free for vehicles under warranty and available for a fee for out-of-warranty vehicles. Standard response time is under 60 minutes.',
      metadata: {
        category: 'emergency',
        keywords: ['roadside', 'assistance', 'emergency', 'help']
      }
    },
    {
      id: 'doc4',
      content: 'Our 2023 Model X SUV features a 300hp engine, 30 MPG fuel efficiency, and seats up to 7 passengers. It comes with a 5-year warranty and qualifies for our 0% financing deal through the end of the month.',
      metadata: {
        category: 'vehicles',
        keywords: ['Model X', 'SUV', 'specs', 'warranty', 'financing']
      }
    }
  ];
  
  // Function to retrieve relevant documents based on a query
  // In a real implementation, this would perform vector similarity search
  const getRelevantDocuments = async (query) => {
    try {
      // Simple keyword matching for demonstration
      // In production, replace with actual vector similarity search
      const keywords = query.toLowerCase().split(' ');
      
      // Filter documents that match any keywords
      const filteredDocs = sampleVectorData.filter(doc => {
        const docContent = doc.content.toLowerCase();
        const docKeywords = doc.metadata.keywords.map(k => k.toLowerCase());
        
        // Check if any keyword is present in content or metadata
        return keywords.some(keyword => 
          docContent.includes(keyword) || 
          docKeywords.some(k => k.includes(keyword) || keyword.includes(k))
        );
      });
      
      // Sort documents by relevance (count of keyword matches)
      const scoredDocs = filteredDocs.map(doc => {
        let score = 0;
        const docContent = doc.content.toLowerCase();
        const docKeywords = doc.metadata.keywords.map(k => k.toLowerCase());
        
        keywords.forEach(keyword => {
          if (docContent.includes(keyword)) score += 1;
          docKeywords.forEach(k => {
            if (k.includes(keyword) || keyword.includes(k)) score += 2;
          });
        });
        
        return { ...doc, score };
      });
      
      // Sort by score and return top 3
      return scoredDocs
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)
        .filter(doc => doc.score > 0);
      
    } catch (error) {
      console.error('Error getting relevant documents:', error);
      return [];
    }
  };
  
  // Function to add a new document to the vector store
  // In a real implementation, this would compute embeddings and store in a vector DB
  const addDocumentToVectorStore = async (content, metadata) => {
    try {
      // In production, this would:
      // 1. Generate embeddings using OpenAI or similar
      // 2. Store in a vector database
      
      // For demonstration, we just add to our sample array
      const newDoc = {
        id: `doc${sampleVectorData.length + 1}`,
        content,
        metadata,
        // In real implementation: embedding: await generateEmbedding(content)
      };
      
      sampleVectorData.push(newDoc);
      return newDoc.id;
    } catch (error) {
      console.error('Error adding document to vector store:', error);
      return null;
    }
  };
  
  module.exports = {
    getRelevantDocuments,
    addDocumentToVectorStore
  };