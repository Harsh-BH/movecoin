import { NextRequest, NextResponse } from "next/server";
import { BOTS } from "@/constants/bot-constant";
import { BOT_IMPLEMENTATIONS } from "@/lib/bot-registry";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const botId = url.searchParams.get("id");

    // If botId is provided, return that specific bot
    if (botId) {
      const bot = BOTS.find(b => b.id === botId);
      
      if (!bot) {
        return NextResponse.json({ error: "Bot not found" }, { status: 404 });
      }
      
      // Enhance response with implementation details
      const implementation = BOT_IMPLEMENTATIONS[botId];
      const enhancedBot = {
        ...bot,
        isImplemented: !!implementation?.isAvailable,
        apiEndpoint: implementation?.apiEndpoint || null
      };
      
      return NextResponse.json({ bot: enhancedBot });
    }
    
    // Otherwise, return all bots with implementation status
    const enhancedBots = BOTS.map(bot => ({
      ...bot,
      isImplemented: !!BOT_IMPLEMENTATIONS[bot.id]?.isAvailable,
      apiEndpoint: BOT_IMPLEMENTATIONS[bot.id]?.apiEndpoint || null
    }));
    
    return NextResponse.json({ bots: enhancedBots });
  } catch (error) {
    console.error("Error fetching bots:", error);
    return NextResponse.json(
      { error: "Failed to fetch bots" },
      { status: 500 }
    );
  }
}

// API endpoint for tracking bot usage and analytics
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { botId, action, userId } = body;
    
    if (!botId || !action) {
      return NextResponse.json({ 
        error: "Missing required parameters" 
      }, { status: 400 });
    }
    
    // In a production environment, this would store interaction data
    console.log(`Bot interaction: ${botId}, Action: ${action}, User: ${userId || 'anonymous'}`);
    
    return NextResponse.json({
      success: true,
      message: "Interaction recorded"
    });
  } catch (error) {
    console.error("Error recording bot interaction:", error);
    return NextResponse.json(
      { error: "Failed to record interaction" },
      { status: 500 }
    );
  }
}