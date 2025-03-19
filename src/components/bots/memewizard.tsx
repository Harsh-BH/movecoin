"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { StarIcon, Users, SendIcon, Download, Share2, Copy, ArrowLeft, Sparkles, CheckCircle2, Info } from "lucide-react";
import Link from "next/link";
import { trackBotUsage } from "@/lib/bot-utils";
import { toast } from "@/components/ui/use-toast";

// NFT meme templates data
const NFT_MEME_TEMPLATES = [
  {
    id: "pixel-art",
    name: "Pixel Art NFT",
    image: "/nft-memes/pixel-art.jpg",
    description: "Retro pixel art style popular in NFT collections like CryptoPunks"
  },
  {
    id: "vaporwave",
    name: "Vaporwave Aesthetic",
    image: "/nft-memes/vaporwave.jpg",
    description: "Nostalgic 80s/90s style with neon colors and retro elements"
  },
  {
    id: "abstract",
    name: "Abstract Digital Art",
    image: "/nft-memes/abstract.jpg",
    description: "Abstract colorful patterns and shapes used in generative NFT projects"
  },
  {
    id: "cyberpunk",
    name: "Cyberpunk Future",
    image: "/nft-memes/cyberpunk.jpg",
    description: "Futuristic dystopian imagery with neon lights and high tech elements"
  },
  {
    id: "meme-classic",
    name: "Classic Meme NFT",
    image: "/nft-memes/meme-classic.jpg",
    description: "Traditional meme formats reimagined as valuable NFT collectibles"
  }
];

// Example conversations with the bot
const EXAMPLE_CONVERSATIONS = [
  {
    question: "Can you create an NFT meme about crypto investing?",
    answer: "Sure! I can help with that. Let me create a clever crypto-themed NFT meme for you."
  },
  {
    question: "Make a Pixel Art NFT with the theme 'To The Moon'",
    answer: "Here's your NFT meme concept in Pixel Art style! The 'To The Moon' theme is perfect for crypto collectors."
  },
  {
    question: "What makes an NFT valuable?",
    answer: "NFTs gain value from uniqueness, creator reputation, cultural significance, and utility. Great NFT memes often capture zeitgeist moments with artistic flair."
  }
];

// Type definitions
type Message = {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  nftMeme?: NFTMeme;
};

type NFTMeme = {
  imageUrl: string;
  title: string;
  description: string;
  template: string;
  templateName: string;
  mainText: string;
  secondaryText?: string;
  attributes: {
    trait_type: string;
    value: string;
  }[];
  metadata: {
    tokenId: string;
    createdAt: string;
    blockchain: string;
    creator: string;
    edition: number;
    totalEditions: number;
  };
  collectionName: string;
};

type MintStatus = 'idle' | 'minting' | 'success' | 'error';

export default function MemeWizard() {
  const [selectedTemplate, setSelectedTemplate] = useState(NFT_MEME_TEMPLATES[0].id);
  const [nftTitle, setNftTitle] = useState("");
  const [nftMainText, setNftMainText] = useState("");
  const [nftDescription, setNftDescription] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: '1', 
      text: "Hello! I'm MemeWizard NFT Generator. I can help you create unique NFT memes. What kind of digital collectible would you like to create today?", 
      sender: 'bot' 
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [generatedNftMeme, setGeneratedNftMeme] = useState<NFTMeme | null>(null);
  const [activeTab, setActiveTab] = useState("chat");
  const [isGenerating, setIsGenerating] = useState(false);
  const [mintStatus, setMintStatus] = useState<MintStatus>('idle');
  const [mintedNFT, setMintedNFT] = useState<any>(null);
  const [walletAddress, setWalletAddress] = useState("0xDefault...");
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Track usage when component mounts
  useEffect(() => {
    trackBotUsage("1", "open");
  }, []);

  // Auto scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const newUserMessage = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: 'user' as const
    };
    
    setMessages(prev => [...prev, newUserMessage]);
    setInputMessage('');
    setIsGenerating(true);
    
    try {
      // Make API call to generate NFT meme
      const response = await fetch('/api/bots/meme-wizard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: inputMessage })
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate NFT meme');
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Store the NFT meme data
        setGeneratedNftMeme(data.nftMeme);
        
        // Add bot response with generated NFT meme
        const botResponse = {
          id: (Date.now() + 1).toString(),
          text: data.message || "Here's your generated NFT meme concept!",
          sender: 'bot' as const,
          nftMeme: data.nftMeme
        };
        
        setMessages(prev => [...prev, botResponse]);
        
        // Track successful generation
        trackBotUsage("1", "generate_nft_meme");
      } else {
        throw new Error(data.error || 'Something went wrong');
      }
    } catch (error) {
      console.error('Error:', error);
      
      // Add error message
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        text: "Sorry, I couldn't generate an NFT meme. Please try again with a different prompt.",
        sender: 'bot' as const
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateNFTMeme = async () => {
    if (!nftTitle.trim() || !nftMainText.trim()) {
      toast({
        title: "Required fields missing",
        description: "Please provide a title and main text for your NFT.",
        variant: "destructive"
      });
      return;
    }
    
    setIsGenerating(true);
    
    try {
      // Create a prompt from the form inputs
      const prompt = `Create an NFT meme with the title "${nftTitle}" using ${
        NFT_MEME_TEMPLATES.find(t => t.id === selectedTemplate)?.name
      } style. The main text is: "${nftMainText}". ${
        nftDescription ? `Additional context: ${nftDescription}` : ''
      }`;
      
      // Call the API
      const response = await fetch('/api/bots/meme-wizard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate NFT');
      }
      
      const data = await response.json();
      
      if (data.success) {
        setGeneratedNftMeme(data.nftMeme);
        
        // Add to chat as well
        const botMessage = {
          id: Date.now().toString(),
          text: "I've created your custom NFT meme! You can mint it now.",
          sender: 'bot' as const,
          nftMeme: data.nftMeme
        };
        
        setMessages(prev => [...prev, botMessage]);
        setActiveTab("chat"); // Switch to chat to show the result
        
        // Track custom generation
        trackBotUsage("1", "custom_nft_meme");
        
        toast({
          title: "NFT Generated",
          description: "Your custom NFT meme is ready to mint!",
        });
      }
    } catch (error) {
      console.error('Error generating NFT meme:', error);
      toast({
        title: "Generation Failed",
        description: "Could not generate NFT meme. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const mintNFT = async (nftMeme: NFTMeme) => {
    setMintStatus('minting');
    
    try {
      // Call minting API
      const response = await fetch('/api/nft-meme-mint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: nftMeme.imageUrl,
          metadata: nftMeme.metadata,
          title: nftMeme.title,
          description: nftMeme.description,
          recipient: walletAddress
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to mint NFT');
      }
      
      const data = await response.json();
      
      if (data.success) {
        setMintedNFT(data.nft);
        setMintStatus('success');
        
        // Send success message in chat
        const mintSuccessMessage = {
          id: Date.now().toString(),
          text: `Congratulations! Your NFT "${nftMeme.title}" has been successfully minted to ${data.nft.owner}. Transaction hash: ${data.nft.transactionHash.substring(0, 10)}...`,
          sender: 'bot' as const
        };
        
        setMessages(prev => [...prev, mintSuccessMessage]);
        
        // Track minting
        trackBotUsage("1", "mint_nft");
        
        toast({
          title: "NFT Minted!",
          description: "Your NFT has been successfully minted to the blockchain.",
          variant: "default"
        });
      } else {
        throw new Error(data.error || 'Minting failed');
      }
    } catch (error) {
      console.error('Error minting NFT:', error);
      setMintStatus('error');
      
      toast({
        title: "Minting Failed",
        description: "There was an error minting your NFT. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="container max-w-6xl mx-auto p-4">
      {/* Bot Header */}
      <div className="mb-6">
        <Link href="/dashboard/bots" className="flex items-center text-muted-foreground mb-4 hover:text-primary">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Bot Marketplace
        </Link>
        
        <div className="flex items-start gap-6 flex-col md:flex-row">
          <div className="relative h-40 w-40 bg-muted rounded-lg overflow-hidden flex-shrink-0">
            <img 
              src="/bots/meme-wizard.png" 
              alt="MemeWizard Bot" 
              className="h-full w-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/placeholder.png";
              }}
            />
            <Badge variant="default" className="absolute top-2 right-2 bg-primary">
              Featured
            </Badge>
          </div>
          
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <h1 className="text-3xl font-bold">MemeWizard NFT Generator</h1>
              <Badge variant="outline">NFT Creation</Badge>
            </div>
            
            <p className="text-muted-foreground mb-2">@memewizard_nft_bot</p>
            
            <p className="mb-4">
              Create unique collectible NFT memes with AI. Generate, customize, and mint your digital art pieces directly to the blockchain.
            </p>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {["nft", "crypto", "digital-art", "collectibles"].map(tag => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center">
                <StarIcon className="h-4 w-4 fill-yellow-400 stroke-yellow-400 mr-1" />
                <span>4.9</span>
              </div>
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-1" />
                <span>92,300 users</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList className="mb-4 grid w-full grid-cols-2">
          <TabsTrigger value="chat">Chat with Bot</TabsTrigger>
          <TabsTrigger value="create">Create NFT</TabsTrigger>
        </TabsList>
        
        {/* Chat Interface */}
        <TabsContent value="chat" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <img 
                  src="/bots/meme-wizard.png" 
                  alt="MemeWizard Bot" 
                  className="h-6 w-6 object-cover rounded"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/placeholder.png";
                  }}
                />
                MemeWizard NFT Chat
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] overflow-y-auto border rounded-md p-4 mb-4">
                {messages.map(message => (
                  <div 
                    key={message.id} 
                    className={`mb-4 ${message.sender === 'bot' ? 'flex justify-start' : 'flex justify-end'}`}
                  >
                    <div 
                      className={`max-w-[80%] p-3 rounded-lg ${
                        message.sender === 'bot' 
                          ? 'bg-muted text-foreground' 
                          : 'bg-primary text-primary-foreground'
                      }`}
                    >
                      <p>{message.text}</p>
                      {message.nftMeme && (
                        <div className="mt-4 space-y-3 border rounded-md p-3 bg-background">
                          <div className="flex justify-between items-center">
                            <h4 className="font-medium">{message.nftMeme.title}</h4>
                            <Badge>{message.nftMeme.templateName}</Badge>
                          </div>
                          <div className="rounded-md overflow-hidden">
                            <img 
                              src={message.nftMeme.imageUrl || "/placeholder.png"} 
                              alt="NFT Meme" 
                              className="w-full h-auto object-contain"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "/placeholder.png";
                              }}
                            />
                          </div>
                          <p className="text-sm text-muted-foreground">{message.nftMeme.description}</p>
                          <div className="flex flex-wrap gap-1">
                            {message.nftMeme.attributes?.map((attr, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {attr.trait_type}: {attr.value}
                              </Badge>
                            ))}
                          </div>
                          <Button 
                            className="w-full" 
                            size="sm"
                            onClick={() => mintNFT(message.nftMeme!)}
                            disabled={mintStatus === 'minting'}
                          >
                            <Sparkles className="mr-2 h-4 w-4" />
                            {mintStatus === 'minting' ? 'Minting...' : 'Mint NFT'}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Ask for an NFT meme concept..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  disabled={isGenerating}
                />
                <Button onClick={handleSendMessage} disabled={isGenerating || !inputMessage.trim()}>
                  {isGenerating ? (
                    <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <SendIcon className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardContent>
            <CardFooter className="flex-col items-start">
              <p className="text-sm font-medium mb-2">Example prompts:</p>
              <div className="flex flex-wrap gap-2">
                {EXAMPLE_CONVERSATIONS.map((convo, index) => (
                  <Badge 
                    key={index} 
                    variant="outline" 
                    className="cursor-pointer hover:bg-secondary"
                    onClick={() => setInputMessage(convo.question)}
                  >
                    {convo.question}
                  </Badge>
                ))}
              </div>
            </CardFooter>
          </Card>
          
          {/* Minted NFT Dialog */}
          {mintedNFT && (
            <Dialog open={mintStatus === 'success'} onOpenChange={(open) => !open && setMintStatus('idle')}>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500" /> 
                    NFT Successfully Minted!
                  </DialogTitle>
                  <DialogDescription>
                    Your NFT has been minted to the blockchain and is now part of your collection.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="rounded-lg overflow-hidden border">
                    <img 
                      src={mintedNFT.imageUrl} 
                      alt={mintedNFT.title} 
                      className="w-full h-auto"
                    />
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-lg">{mintedNFT.title}</h4>
                    <p className="text-sm text-muted-foreground">{mintedNFT.description}</p>
                    
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Token ID:</span>
                        <span className="font-mono">{mintedNFT.tokenId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Owner:</span>
                        <span className="font-mono">{mintedNFT.owner.substring(0, 6)}...{mintedNFT.owner.substring(mintedNFT.owner.length - 4)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Transaction:</span>
                        <span className="font-mono">{mintedNFT.transactionHash.substring(0, 6)}...{mintedNFT.transactionHash.substring(mintedNFT.transactionHash.length - 4)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <DialogFooter className="sm:justify-start">
                  <div className="flex gap-2 w-full">
                    <Button className="flex-1" onClick={() => window.open(mintedNFT.openseaUrl, '_blank')}>
                      View on OpenSea
                    </Button>
                    <Button variant="outline" onClick={() => setMintStatus('idle')}>
                      Close
                    </Button>
                  </div>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </TabsContent>
        
        {/* Create NFT Interface */}
        <TabsContent value="create" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Create a Custom NFT Meme</CardTitle>
              <CardDescription>
                Design your own unique NFT meme for minting on the blockchain
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* NFT Creation Form */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="nft-title" className="text-sm font-medium">
                      NFT Title <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id="nft-title"
                      placeholder="Enter a catchy title for your NFT"
                      value={nftTitle}
                      onChange={(e) => setNftTitle(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="template" className="text-sm font-medium">
                      Art Style <span className="text-red-500">*</span>
                    </label>
                    <Select
                      value={selectedTemplate}
                      onValueChange={setSelectedTemplate}
                    >
                      <SelectTrigger id="template">
                        <SelectValue placeholder="Select an NFT style" />
                      </SelectTrigger>
                      <SelectContent>
                        {NFT_MEME_TEMPLATES.map(template => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      {NFT_MEME_TEMPLATES.find(t => t.id === selectedTemplate)?.description}
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="main-text" className="text-sm font-medium">
                      Main Text/Concept <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id="main-text"
                      placeholder="The primary text or concept for your NFT"
                      value={nftMainText}
                      onChange={(e) => setNftMainText(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="description" className="text-sm font-medium">
                      Description
                    </label>
                    <Textarea
                      id="description"
                      placeholder="Describe your NFT and what makes it special"
                      value={nftDescription}
                      onChange={(e) => setNftDescription(e.target.value)}
                      rows={3}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="wallet-address" className="text-sm font-medium flex items-center">
                      Wallet Address
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="ml-1 h-3 w-3 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="w-[200px] text-xs">
                              The Ethereum wallet address that will own this NFT after minting.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </label>
                    <Input
                      id="wallet-address"
                      placeholder="Enter your ETH wallet address (0x...)"
                      value={walletAddress}
                      onChange={(e) => setWalletAddress(e.target.value)}
                    />
                  </div>
                  
                  <Button 
                    className="w-full"
                    onClick={generateNFTMeme}
                    disabled={isGenerating || !nftTitle.trim() || !nftMainText.trim()}
                  >
                    {isGenerating ? (
                      <>
                        <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Generate NFT Meme
                      </>
                    )}
                  </Button>
                </div>
                
                {/* Preview */}
                <div className="space-y-4">
                  <div className="text-sm font-medium">Preview</div>
                  <div className="relative border rounded-md overflow-hidden bg-muted aspect-square">
                    {generatedNftMeme ? (
                      <div className="relative w-full h-full">
                        <img 
                          src={generatedNftMeme.imageUrl} 
                          alt={generatedNftMeme.title} 
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "/placeholder.png";
                          }}
                        />
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full text-muted-foreground">
                        {isGenerating ? (
                          <div className="flex flex-col items-center">
                            <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-2"></div>
                            <p>Generating NFT meme...</p>
                          </div>
                        ) : (
                          'NFT preview will appear here'
                        )}
                      </div>
                    )}
                  </div>
                  
                  {generatedNftMeme && (
                    <div className="space-y-3">
                      <h3 className="font-semibold">{generatedNftMeme.title}</h3>
                      <p className="text-sm text-muted-foreground">{generatedNftMeme.description}</p>
                      
                      <div className="space-y-1">
                        <div className="text-sm font-medium">Attributes:</div>
                        <div className="flex flex-wrap gap-1">
                          {generatedNftMeme.attributes?.map((attr, idx) => (
                            <Badge key={idx} variant="outline">
                              {attr.trait_type}: {attr.value}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          className="flex-1" 
                          onClick={() => mintNFT(generatedNftMeme)}
                          disabled={mintStatus === 'minting'}
                        >
                          {mintStatus === 'minting' ? (
                            <>
                              <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                              Minting...
                            </>
                          ) : (
                            <>
                              <Sparkles className="mr-2 h-4 w-4" />
                              Mint NFT
                            </>
                          )}
                        </Button>
                        <Button variant="outline" className="flex-1">
                          <Share2 className="h-4 w-4 mr-2" />
                          Share
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}