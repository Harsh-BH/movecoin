import React, { lazy } from 'react';
import { Bot } from "@/constants/bot-constant";

// Define bot implementation types
export type BotImplementation = {
  id: string;
  name: string;
  component: React.ComponentType<any>;
  apiEndpoint?: string;
  isAvailable: boolean;
};

// Import bot components with lazy loading for better performance
const MemeWizard = lazy(() => import("@/components/bots/memewizard"));
// Add other bot components as they're implemented

// Registry of available bot implementations
export const BOT_IMPLEMENTATIONS: Record<string, BotImplementation> = {
  "1": { // MemeWizard
    id: "1",
    name: "MemeWizard",
    component: MemeWizard,
    apiEndpoint: "/api/bots/meme-wizard",
    isAvailable: true,
  },
  // Add other bots as they're implemented
  // "2": { // TaskMaster
  //   id: "2",
  //   name: "TaskMaster",
  //   component: TaskMaster,
  //   apiEndpoint: "/api/bots/task-master",
  //   isAvailable: false, // Not implemented yet
  // },
};

// Helper function to check if a bot is implemented
export function isBotImplemented(botId: string): boolean {
  return BOT_IMPLEMENTATIONS[botId]?.isAvailable || false;
}

// Helper function to get bot implementation
export function getBotImplementation(botId: string): BotImplementation | null {
  return BOT_IMPLEMENTATIONS[botId] || null;
}