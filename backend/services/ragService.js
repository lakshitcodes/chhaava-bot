// backend/services/ragService.js
// This service handles the Retrieval-Augmented Generation vector search

// Note: In a real implementation, you would connect to a vector database
// like Pinecone, Weaviate, or use OpenAI embeddings with your own storage

// Updated and expanded document set with Indian car dealership information
const sampleVectorData = [
  {
    id: 'doc1',
    content: "Our service center operates Monday to Saturday from 9:00 AM to 7:00 PM. Book an appointment via our website or call +91 7678176206.",
    metadata: {
      category: "service",
      keywords: ["service hours", "appointment", "customer support"]
    }
  },
  {
    id: 'doc2',
    content: "Book a test drive for any vehicle in our showroom. A valid Indian driving license is required.",
    metadata: {
      category: "sales",
      keywords: ["test drive", "car booking", "vehicle demo"]
    }
  },
  {
    id: 'doc3',
    content: "24/7 roadside assistance available. Call our toll-free number 1800-HELP-IND. Free for in-warranty vehicles.",
    metadata: {
      category: "emergency",
      keywords: ["roadside assistance", "breakdown help", "emergency support"]
    }
  },
  {
    id: 'doc4',
    content: "Our latest SUV model features a 1500cc engine, delivers 18 km/l mileage, and seats 7 passengers.",
    metadata: {
      category: "vehicles",
      keywords: ["SUV", "fuel efficiency", "car specs"]
    }
  },
  {
    id: 'doc5',
    content: "0% interest financing for 12 months on all new vehicles this festival season. Apply now!",
    metadata: {
      category: "finance",
      keywords: ["loan options", "EMI plans", "festival offers"]
    }
  },
  {
    id: 'doc6',
    content: "All new cars include a 5-year comprehensive warranty and 24/7 roadside assistance.",
    metadata: {
      category: "warranty",
      keywords: ["warranty coverage", "repair assistance", "long-term support"]
    }
  },
  {
    id: 'doc7',
    content: "Comprehensive and third-party car insurance plans available with hassle-free claims.",
    metadata: {
      category: "insurance",
      keywords: ["car insurance", "third-party policy", "insurance claims"]
    }
  },
  {
    id: 'doc8',
    content: "Exchange your old vehicle for discounts on a new model through our trade-in program.",
    metadata: {
      category: "trade-in",
      keywords: ["exchange car", "buyback program", "discount offers"]
    }
  },
  {
    id: 'doc9',
    content: "Our electric cars offer a 350 km range per charge with fast-charging options available.",
    metadata: {
      category: "electric vehicles",
      keywords: ["EV range", "battery charging", "eco-friendly cars"]
    }
  },
  {
    id: 'doc10',
    content: "Special Diwali discounts on car accessories and servicing packages for a limited time.",
    metadata: {
      category: "offers",
      keywords: ["Diwali sale", "discount deals", "car servicing offers"]
    }
  },
  {
    id: 'doc11',
    content: "Petrol vs Diesel: Cost, mileage, and maintenance comparison for Indian car buyers.",
    metadata: {
      category: "comparison",
      keywords: ["fuel type", "diesel vs petrol", "car running cost"]
    }
  },
  {
    id: 'doc12',
    content: "Locate our dealership: We have 100+ showrooms across India for your convenience.",
    metadata: {
      category: "locations",
      keywords: ["car showroom", "dealer network", "nearest location"]
    }
  },
  {
    id: 'doc13',
    content: "Step-by-step guide to registering your vehicle with the RTO in India.",
    metadata: {
      category: "registration",
      keywords: ["RTO process", "car registration", "vehicle documents"]
    }
  },
  {
    id: 'doc14',
    content: "Upcoming 2025 car models: Sneak peek into the newest launches in India.",
    metadata: {
      category: "future vehicles",
      keywords: ["new car models", "2025 launches", "upcoming cars"]
    }
  },
  {
    id: 'doc15',
    content: "Essential monsoon car maintenance tips to keep your vehicle safe during rains.",
    metadata: {
      category: "maintenance",
      keywords: ["monsoon safety", "car care tips", "vehicle maintenance"]
    }
  },
  {
    id: 'doc16',
    content: "Understanding GST impact on car prices in India and how it affects buyers.",
    metadata: {
      category: "taxation",
      keywords: ["GST on cars", "tax rules", "car price changes"]
    }
  },
  {
    id: 'doc17',
    content: "Luxury car leasing: Flexible EMI plans and ownership options for premium cars.",
    metadata: {
      category: "leasing",
      keywords: ["car lease", "luxury vehicle financing", "premium car EMI"]
    }
  },
  {
    id: 'doc18',
    content: "Best-selling cars in India for 2024 based on market trends and customer preferences.",
    metadata: {
      category: "market trends",
      keywords: ["popular cars", "best sellers", "automobile market"]
    }
  },
  {
    id: 'doc19',
    content: "How to file a car insurance claim after an accident: A step-by-step guide.",
    metadata: {
      category: "claims",
      keywords: ["insurance claim", "accident process", "car damage reimbursement"]
    }
  },
  // MG Comet EV specific documents
  {
    id: 'doc20',
    content: "The MG Comet EV caters to the tech-forward individuals with an array of internet features designed to simplify driving experiences. Its integrated technology seamlessly connects users to various services, offering convenience and ease of use during urban commutes.",
    metadata: {
      category: "electric vehicles",
      keywords: ["MG Comet EV", "connected car", "tech features"]
    }
  },
  {
    id: 'doc21',
    content: "i-Smart with 55+ Connected car features are available in Excite / Excite FC, Exclusive / Exclusive FC, Blackstorm variant & 100-Year Edition only and not in Executive variant.",
    metadata: {
      category: "connected features",
      keywords: ["i-Smart", "connected car", "MG Comet variants"]
    }
  },
  {
    id: 'doc22',
    content: "Voice commands for car functions, AC ON/OFF, radio, remaining mileage, and more are available in Excite, Excite FC, Exclusive, Exclusive FC & 100-Year Edition variants of MG Comet EV.",
    metadata: {
      category: "voice control",
      keywords: ["voice commands", "car control", "MG Comet features"]
    }
  },
  {
    id: 'doc23',
    content: "The MG Comet EV offers 30+ Hinglish Voice Commands and Chit Chat Voice Interaction in Excite, Excite FC, Exclusive, and Exclusive FC variants for enhanced driving convenience.",
    metadata: {
      category: "voice control",
      keywords: ["Hinglish commands", "voice interaction", "MG Comet features"]
    }
  },
  {
    id: 'doc24',
    content: "Jio Voice Commands for Weather, Cricket, Calculator, Clock, Date/Day, Horoscope, Stock Market, Dictionary, News & Knowledge are exclusively available in the 100-Year Edition of MG Comet EV.",
    metadata: {
      category: "voice control",
      keywords: ["Jio voice commands", "premium features", "100-Year Edition"]
    }
  },
  {
    id: 'doc25',
    content: "Customize your MG Comet EV experience with Widget Customization, 7-color palette for Homepage, and Theme Store options available in premium variants.",
    metadata: {
      category: "infotainment",
      keywords: ["widget customization", "theme store", "UI personalization"]
    }
  },
  {
    id: 'doc26',
    content: "Enhanced security features in MG Comet EV include Valet Mode and Quiet Mode available in Excite, Exclusive and 100-Year Edition variants.",
    metadata: {
      category: "security",
      keywords: ["valet mode", "quiet mode", "car security"]
    }
  },
  {
    id: 'doc27',
    content: "Digital Bluetooth®️ Key with Key sharing function is available exclusively in MG Comet EV's Exclusive, Exclusive FC & 100-Year Edition variants.",
    metadata: {
      category: "security",
      keywords: ["digital key", "bluetooth key", "key sharing"]
    }
  },
  {
    id: 'doc28',
    content: "Control your MG Comet EV remotely with i-SMART app features including Audio control, AC ON/OFF, Live Location Sharing & Tracking available in premium variants.",
    metadata: {
      category: "remote control",
      keywords: ["remote features", "i-SMART app", "car control"]
    }
  },
  {
    id: 'doc29',
    content: "Safety features in MG Comet EV include Vehicle Overspeed Alert, Critical Tyre Pressure Voice Alert, Low Battery Alert, e-Call, and i-Call available in premium variants.",
    metadata: {
      category: "safety",
      keywords: ["safety alerts", "emergency call", "vehicle monitoring"]
    }
  },
  {
    id: 'doc30',
    content: "Stay connected in your MG Comet EV with Wi-Fi Connectivity and Over The Air (OTA) Updates available in Excite, Exclusive and 100-Year Edition variants.",
    metadata: {
      category: "connectivity",
      keywords: ["WiFi", "OTA updates", "connected car"]
    }
  },
  {
    id: 'doc31',
    content: "Track your eco-friendly driving with Ecotree - CO2 saved data on infotainment & i-SMART app available in all premium variants of MG Comet EV.",
    metadata: {
      category: "eco-features",
      keywords: ["eco driving", "CO2 tracking", "sustainable features"]
    }
  },
  // MG Comet EV pricing documents
  {
    id: 'doc32',
    content: "MG Comet EV EXECUTIVE variant priced at Rs. 6,99,800 (Ex-Showroom). Price effective from 4th January, 2024. T&C apply.",
    metadata: {
      category: "pricing",
      keywords: ["MG Comet price", "EXECUTIVE variant", "EV pricing"]
    }
  },
  {
    id: 'doc33',
    content: "MG Comet EV EXCITE variant priced at Rs. 8,20,000 (Ex-Showroom). Price effective from 4th January, 2024. T&C apply.",
    metadata: {
      category: "pricing",
      keywords: ["MG Comet price", "EXCITE variant", "EV pricing"]
    }
  },
  {
    id: 'doc34',
    content: "MG Comet EV EXCITE FC variant priced at Rs. 8,72,800 (Ex-Showroom). Price effective from 4th January, 2024. T&C apply.",
    metadata: {
      category: "pricing",
      keywords: ["MG Comet price", "EXCITE FC variant", "EV pricing"]
    }
  },
  {
    id: 'doc35',
    content: "MG Comet EV EXCLUSIVE variant priced at Rs. 9,25,800 (Ex-Showroom). Price effective from 4th January, 2024. T&C apply.",
    metadata: {
      category: "pricing",
      keywords: ["MG Comet price", "EXCLUSIVE variant", "EV pricing"]
    }
  },
  {
    id: 'doc36',
    content: "MG Comet EV EXCLUSIVE FC variant priced at Rs. 9,67,800 (Ex-Showroom). Price effective from 4th January, 2024. T&C apply.",
    metadata: {
      category: "pricing",
      keywords: ["MG Comet price", "EXCLUSIVE FC variant", "EV pricing"]
    }
  },
  {
    id: 'doc37',
    content: "MG Comet EV EXCLUSIVE FC (100-YEAR EDITION) variant priced at Rs. 9,83,800 (Ex-Showroom). Price effective from 4th January, 2024. T&C apply.",
    metadata: {
      category: "pricing",
      keywords: ["MG Comet price", "100-YEAR EDITION", "premium variant"]
    }
  },
  {
    id: 'doc38',
    content: "MG Comet EV BLACKSTORM variant priced at Rs. 9,80,800 (Ex-Showroom). T&C Apply.",
    metadata: {
      category: "pricing",
      keywords: ["MG Comet price", "BLACKSTORM variant", "special edition"]
    }
  },
  // Additional MG Comet EV feature documents
  {
    id: 'doc39',
    content: "Charging details on infotainment system are available in MG Comet EV's Exclusive, Exclusive FC & 100-Year Edition variants only.",
    metadata: {
      category: "charging",
      keywords: ["charging details", "infotainment", "premium features"]
    }
  },
  {
    id: 'doc40',
    content: "Set maximum speed limits from 30 to 80 kmph in MG Comet EV's Excite, Exclusive and 100-Year Edition variants for enhanced safety and control.",
    metadata: {
      category: "safety",
      keywords: ["speed setting", "safety feature", "speed limit"]
    }
  },
  {
    id: 'doc41',
    content: "Enjoy premium music with Jio Saavn (In-built Online Music App) exclusively available in MG Comet EV's 100-Year Edition.",
    metadata: {
      category: "entertainment",
      keywords: ["Jio Saavn", "music app", "premium features"]
    }
  },
  {
    id: 'doc42',
    content: "Locate charging stations easily with the Charging Station Search feature available in all premium variants of MG Comet EV.",
    metadata: {
      category: "charging",
      keywords: ["charging station", "EV infrastructure", "location service"]
    }
  },
  {
    id: 'doc43',
    content: "Get 100% charging notifications on the i-SMART app for your MG Comet EV in all premium variants.",
    metadata: {
      category: "charging",
      keywords: ["charging notification", "i-SMART app", "EV monitoring"]
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