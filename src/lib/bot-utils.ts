// Utility functions for working with bots

/**
 * Generate a placeholder image URL for bots without images
 */
export function getPlaceholderImage(botName: string): string {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(botName)}&background=random`;
  }
  
  /**
   * Format numbers for display (e.g., 1500 -> 1.5k)
   */
  export function formatNumber(num: number): string {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}m`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  }
  
  /**
   * Generate a chat message ID
   */
  export function generateMessageId(): string {
    return Math.random().toString(36).substring(2, 15);
  }
  
  /**
   * Helper for tracking bot usage analytics
   */
  export function trackBotUsage(botId: string, action: string): void {
    try {
      // In a real app, you might send this to an analytics service
      console.log(`Bot usage: ${botId}, Action: ${action}`);
      
      // Example of storing basic usage in localStorage
      const usageKey = `bot_usage_${botId}`;
      const currentUsage = localStorage.getItem(usageKey);
      const usage = currentUsage ? parseInt(currentUsage) + 1 : 1;
      localStorage.setItem(usageKey, usage.toString());
    } catch (e) {
      console.error("Error tracking bot usage:", e);
    }
  }