"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { X, Send, CornerDownLeft, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import ReactMarkdown from 'react-markdown';
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Network } from "@aptos-labs/ts-sdk";

interface ChatMessage {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
}

interface ChatSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const SUGGESTED_QUESTIONS = [
  "What is MoveCoin?",
  "How do I create a wallet?",
  "Show me my balance",
  "What are Move modules?",
  "How do I transfer tokens?"
];

export function ChatSidebar({ isOpen, onClose }: ChatSidebarProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  
  // Get wallet information if available
  const { connected, network, account } = useWallet();
  
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  
  // Focus input when sidebar opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);
  
  const handleSendMessage = async (text?: string) => {
    const message = text || input;
    if (!message.trim() || isLoading) return;
    
    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: message,
      role: "user",
      timestamp: new Date()
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setShowSuggestions(false);
    
    try {
      // Determine network to use
      const apiNetwork = network || Network.TESTNET;
      
      // Call the actual chatbot API
      const response = await fetch("/api/chatbot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          network: apiNetwork,
          show_intermediate_steps: false
        })
      });

      if (!response.ok) {
        throw new Error(`API error ${response.status}: ${await response.text()}`);
      }
      
      // Create a placeholder message that we'll update as we receive chunks
      const aiMessageId = (Date.now() + 1).toString();
      let aiContent = "";
      
      setMessages((prev) => [...prev, {
        id: aiMessageId,
        content: aiContent,
        role: "assistant",
        timestamp: new Date()
      }]);
      
      // Handle streaming response
      const reader = response.body?.getReader();
      if (!reader) throw new Error("Failed to read response stream");
      
      const decoder = new TextDecoder();
      
      // Read stream chunks
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        aiContent += chunk;
        
        // Update the assistant's message with each chunk
        setMessages((prev) => prev.map(msg => 
          msg.id === aiMessageId 
            ? { ...msg, content: aiContent } 
            : msg
        ));
      }
      
      // Final decode to handle any remaining bytes
      const finalChunk = decoder.decode();
      if (finalChunk) {
        aiContent += finalChunk;
        setMessages((prev) => prev.map(msg => 
          msg.id === aiMessageId 
            ? { ...msg, content: aiContent } 
            : msg
        ));
      }
      
    } catch (error) {
      console.error("Error sending message:", error);
      // Add an error message
      setMessages((prev) => [...prev, {
        id: Date.now().toString(),
        content: "Sorry, I encountered an error processing your request. Please try again later.",
        role: "assistant",
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const handleSuggestionClick = (question: string) => {
    handleSendMessage(question);
  };
  
  const clearChat = () => {
    setMessages([]);
    setShowSuggestions(true);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-y-0 right-0 z-50 w-full sm:w-[400px] shadow-xl bg-background border-l"
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
        >
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center space-x-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/logo.svg" />
                  <AvatarFallback>MC</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium text-sm">MoveCoin Assistant</h3>
                  <p className="text-xs text-muted-foreground">
                    {connected ? `Connected to ${network}` : 'AI powered help'}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full space-y-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src="/logo.svg" />
                    <AvatarFallback>MC</AvatarFallback>
                  </Avatar>
                  <div className="text-center space-y-2">
                    <h3 className="font-medium">MoveCoin Assistant</h3>
                    <p className="text-sm text-muted-foreground max-w-xs">
                      Ask me anything about MoveCoin, wallets, or blockchain operations.
                    </p>
                  </div>
                </div>
              )}
              
              {showSuggestions && messages.length === 0 && (
                <div className="mt-6">
                  <p className="text-center text-xs text-muted-foreground mb-3">Try asking about:</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {SUGGESTED_QUESTIONS.map((q, i) => (
                      <Button
                        key={i}
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={() => handleSuggestionClick(q)}
                      >
                        {q}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
              
              {messages.map((msg) => (
                <div 
                  key={msg.id}
                  className={cn(
                    "flex",
                    msg.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[80%] rounded-lg p-3",
                      msg.role === "user" 
                        ? "bg-primary text-primary-foreground" 
                        : "bg-muted"
                    )}
                  >
                    {msg.role === "assistant" ? (
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <ReactMarkdown>
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <p>{msg.content}</p>
                    )}
                    <div 
                      className={cn(
                        "text-xs mt-1",
                        msg.role === "user" ? "text-primary-foreground/70" : "text-muted-foreground"
                      )}
                    >
                      {msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </div>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-muted p-3 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <p className="text-sm">Thinking...</p>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
            
            {/* Input */}
            <div className="p-4 border-t">
              <div className="flex items-center gap-2">
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your message..."
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button 
                  size="icon"
                  disabled={!input.trim() || isLoading}
                  onClick={() => handleSendMessage()}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
              
              {messages.length > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="mt-2 text-xs w-full"
                  onClick={clearChat}
                >
                  Clear conversation
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}