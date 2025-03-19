import { NextRequest, NextResponse } from "next/server";
import { Groq } from "groq-sdk";
import { v4 as uuidv4 } from 'uuid';

// Initialize GROQ client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Define NFT meme templates and styles
const NFT_MEME_TEMPLATES = [
  {
    id: "pixel-art",
    name: "Pixel Art NFT",
    description: "Retro pixel art style popular in NFT collections like CryptoPunks"
  },
  {
    id: "vaporwave",
    name: "Vaporwave Aesthetic",
    description: "Nostalgic 80s/90s style with neon colors and retro elements"
  },
  {
    id: "abstract",
    name: "Abstract Digital Art",
    description: "Abstract colorful patterns and shapes used in generative NFT projects"
  },
  {
    id: "cyberpunk",
    name: "Cyberpunk Future",
    description: "Futuristic dystopian imagery with neon lights and high tech elements"
  },
  {
    id: "meme-classic",
    name: "Classic Meme NFT",
    description: "Traditional meme formats reimagined as valuable NFT collectibles"
  }
];

// NFT rarity levels for metadata
const RARITY_LEVELS = ["Common", "Uncommon", "Rare", "Epic", "Legendary"];

// Validate GROQ API key
const validateApiKey = () => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not defined in environment variables");
  }
  if (apiKey === "your-api-key-here") {
    throw new Error("GROQ_API_KEY appears to be invalid");
  }
  return true;
};

export async function POST(request: NextRequest) {
  try {
    // Validate API key
    validateApiKey();
    
    // Parse the request
    const body = await request.json();
    const { prompt, conversation } = body;

    console.log("Request received:", { prompt, conversationLength: conversation?.length });

    // For security, ensure we have a valid prompt
    if (!prompt && (!conversation || conversation.length === 0)) {
      return NextResponse.json(
        { error: "No prompt or conversation provided" },
        { status: 400 }
      );
    }

    // Generate a unique token ID for the NFT meme
    const tokenId = uuidv4().substring(0, 8);

    // Prepare the system message with context about NFT meme creation
    const systemMessage = {
      role: "system",
      content: `You are MemeWizard NFT Generator, an AI specialized in creating memes as digital collectibles.
      
      Available NFT style templates:
      ${NFT_MEME_TEMPLATES.map(t => `- ${t.name}: ${t.description}`).join('\n')}
      
      When the user asks for a meme, create an NFT-worthy concept with:
      1. Choose the most appropriate template/style from the available templates
      2. Create a creative and original meme concept
      3. Add unique attributes that would make it valuable as a collectible
      
      Structure your response as JSON that can be parsed:
      {
        "template": "template-id",
        "title": "Catchy title for the NFT meme",
        "mainText": "Main text for the meme (keep it short and memorable)",
        "secondaryText": "Optional secondary text element",
        "description": "Brief description of what makes this meme special",
        "attributes": [
          {"trait_type": "Style", "value": "Name of style"},
          {"trait_type": "Mood", "value": "Emotion conveyed"},
          {"trait_type": "Rarity", "value": "Rarity level"}
        ],
        "collectionName": "Suggested collection name this NFT could belong to"
      }
      
      Valid template-id values: "pixel-art", "vaporwave", "abstract", "cyberpunk", "meme-classic".
      Be creative and original! Great NFT memes are unique, culturally relevant, and have collecting value.`
    };

    // Build messages array
    const messages = [
      systemMessage,
      ...(conversation || []),
      { role: "user", content: prompt || conversation[conversation.length - 1].content }
    ];

    console.log("Calling GROQ API...");

    // Use a fallback model if preferred model fails
    let completion;
    try {
      // Call GROQ to generate the NFT meme content
      completion = await groq.chat.completions.create({
        model: "llama3-70b-8192",  // GROQ's high-quality model
        messages: messages as any,
        temperature: 0.8, // Higher temperature for more creativity
        max_tokens: 800,
        response_format: { type: "json_object" }
      });
    } catch (modelError) {
      console.error("Error with primary model, trying fallback:", modelError);
      
      // Try with a fallback model
      completion = await groq.chat.completions.create({
        model: "mixtral-8x7b-32768",  // Fallback model
        messages: messages as any,
        temperature: 0.8,
        max_tokens: 800,
        response_format: { type: "json_object" }
      });
    }

    // Extract the AI's response
    const aiResponse = completion.choices[0].message.content;
    console.log("AI Response received:", aiResponse?.substring(0, 100) + "...");
    
    // Parse the response as JSON
    let nftMemeData;
    try {
      nftMemeData = JSON.parse(aiResponse || '{}');
      
      // Validate required fields
      if (!nftMemeData.template || !nftMemeData.title) {
        throw new Error("Incomplete JSON response from AI");
      }
    } catch (e) {
      console.error("Failed to parse AI response as JSON:", e);
      console.error("Raw response:", aiResponse);
      
      // Try to extract JSON from the response if it's embedded in text
      try {
        const jsonMatch = aiResponse?.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          nftMemeData = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error("Could not extract JSON");
        }
      } catch (extractError) {
        return NextResponse.json(
          { error: "Failed to generate NFT meme data", details: e.message },
          { status: 500 }
        );
      }
    }

    // Ensure template is valid or set default
    if (!nftMemeData.template || !NFT_MEME_TEMPLATES.some(t => t.id === nftMemeData.template)) {
      console.warn("Invalid template specified:", nftMemeData.template);
      nftMemeData.template = "pixel-art"; // Default to pixel art if invalid
    }

    // Get template details
    const templateDetails = NFT_MEME_TEMPLATES.find(t => t.id === nftMemeData.template) || NFT_MEME_TEMPLATES[0];
    
    console.log("Template selected:", templateDetails.name);
    
    // Add additional NFT metadata
    const nftMetadata = {
      tokenId: tokenId,
      createdAt: new Date().toISOString(),
      blockchain: "Ethereum",
      creator: "MemeWizard AI",
      edition: Math.floor(Math.random() * 100) + 1,
      totalEditions: 100,
    };
    
    // Ensure attributes array exists
    if (!nftMemeData.attributes || !Array.isArray(nftMemeData.attributes)) {
      nftMemeData.attributes = [];
    }
    
    // Assign a rarity level if not already present
    if (!nftMemeData.attributes.some(attr => attr.trait_type === "Rarity")) {
      const randomRarityIndex = Math.floor(Math.random() * RARITY_LEVELS.length);
      nftMemeData.attributes.push({
        trait_type: "Rarity",
        value: RARITY_LEVELS[randomRarityIndex]
      });
    }
    
    // Generate image URL with template and token ID
    const imageUrl = `/api/nft-meme-image?template=${nftMemeData.template}&tokenId=${tokenId}&mainText=${encodeURIComponent(nftMemeData.mainText || '')}`;
    
    console.log("NFT meme generated successfully");
    
    return NextResponse.json({
      success: true,
      nftMeme: {
        ...nftMemeData,
        templateName: templateDetails.name,
        imageUrl: imageUrl,
        metadata: nftMetadata
      },
      message: "Your NFT meme has been generated!"
    });
    
  } catch (error) {
    console.error("Error generating NFT meme:", error);
    
    // Provide more detailed error information
    return NextResponse.json(
      { 
        error: "Failed to generate NFT meme", 
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}