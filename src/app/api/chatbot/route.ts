import { Account, Aptos, AptosConfig, Ed25519PrivateKey, Network, PrivateKey, PrivateKeyVariants } from "@aptos-labs/ts-sdk"
import { Message as VercelChatMessage } from "ai"
import { AgentRuntime, LocalSigner, createAptosTools } from "move-agent-kit"
import { NextResponse } from "next/server"
import OpenAI from "openai"

// Direct function to create a wallet - separate from the agent system
async function createNewAptosWallet() {
  try {
    console.log("Directly creating new Aptos account...");
    // Generate a new account with default ED25519 key scheme
    const newAccount = Account.generate();
    
    // Get the private key as a hex string
    const privateKeyHex = Buffer.from(newAccount.privateKey.toUint8Array()).toString('hex');
    
    // Get the account address
    const address = newAccount.accountAddress.toString();
    
    console.log("Successfully created account:", { address });
    
    return {
      success: true,
      address: address,
      privateKey: privateKeyHex,
    };
  } catch (error: any) {
    console.error("Error creating Aptos account:", error);
    throw new Error(`Failed to create Aptos account: ${error.message}`);
  }
}

// Custom tools for Aptos blockchain interactions
const createCustomAptosTools = (aptosAgent: AgentRuntime) => {
  const baseTools = createAptosTools(aptosAgent);
  
  // Add custom tools for faucet funding and transfers
  return [
    ...baseTools,
    {
      type: "function",
      function: {
        name: "fund_from_faucet",
        description: "Fund an Aptos account from the faucet (only works on TESTNET and DEVNET)",
        parameters: {
          type: "object",
          properties: {
            address: {
              type: "string",
              description: "The address of the account to fund"
            },
            amount: {
              type: "number",
              description: "Amount of APT tokens to fund (default is 1 APT)"
            }
          },
          required: ["address"]
        }
      },
      func: async ({ address, amount = 1 }: { address: string, amount?: number }) => {
        try {
          if (aptosAgent.signer.network === Network.MAINNET) {
            return {
              success: false,
              error: "Faucet is only available on TESTNET and DEVNET networks"
            };
          }
          
          const aptos = aptosAgent.aptos;
          // Use Math.round to avoid floating point precision issues
          const amountInOctas = Math.round(amount * 100000000);
          
          const response = await aptos.fundAccount({
            accountAddress: address,
            amount: amountInOctas
          });
          
          return {
            success: true,
            txnHash: response.hash,
            message: `Successfully funded ${address} with ${amount} APT tokens`
          };
        } catch (error: any) {
          console.error("Error funding from faucet:", error);
          return {
            success: false,
            error: error.message || "Failed to fund account from faucet",
          };
        }
      }
    },
    {
      type: "function",
      function: {
        name: "transfer_apt",
        description: "Transfer APT tokens from the agent's account to another address",
        parameters: {
          type: "object",
          properties: {
            recipient: {
              type: "string",
              description: "Recipient address"
            },
            amount: {
              type: "number",
              description: "Amount of APT tokens to transfer"
            }
          },
          required: ["recipient", "amount"]
        }
      },
      func: async ({ recipient, amount }: { recipient: string, amount: number }) => {
        try {
          const aptos = aptosAgent.aptos;
          const signer = aptosAgent.signer;
          
          // Convert amount to octas (APT has 8 decimals) using safer calculation
          const amountInOctas = Math.round(amount * 100000000);
          
          // Create and sign transaction
          const transaction = await aptos.transaction.build.simple({
            sender: signer.account.accountAddress,
            data: {
              function: "0x1::aptos_account::transfer",
              typeArguments: [],
              functionArguments: [recipient, amountInOctas.toString()]
            }
          });
          
          const signedTxn = await signer.signTransaction(transaction);
          const pendingTxn = await aptos.transaction.submit.simple(signedTxn);
          const txnResult = await aptos.waitForTransaction({transactionHash: pendingTxn.hash});
          
          return {
            success: true,
            txnHash: pendingTxn.hash,
            message: `Successfully transferred ${amount} APT to ${recipient}`
          };
        } catch (error: any) {
          console.error("Error transferring tokens:", error);
          return {
            success: false,
            error: error.message || "Failed to transfer tokens",
          };
        }
      }
    }
  ];
};

// Initialize OpenAI client - REPLACED LangChain implementation
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Function to check if a message is asking to create a wallet
function isWalletCreationRequest(message: string): boolean {
  const lowerMsg = message.toLowerCase();
  return (
    lowerMsg.includes("create wallet") ||
    lowerMsg.includes("create a wallet") ||
    lowerMsg.includes("create account") ||
    lowerMsg.includes("create a new account") ||
    lowerMsg.includes("new wallet") ||
    lowerMsg.includes("generate wallet") ||
    lowerMsg.includes("make a wallet") ||
    lowerMsg.includes("create aptos wallet") ||
    lowerMsg.includes("create aptos account")
  );
}

export async function POST(request: Request) {
  try {
    // Get network from request body
    const body = await request.json()
    const messages = body.messages ?? []
    const network = body.network ?? Network.MAINNET
    const showIntermediateSteps = body.show_intermediate_steps ?? false

    // Check if this is a wallet creation request
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.role === "user" && isWalletCreationRequest(lastMessage.content)) {
      try {
        // Directly handle wallet creation without using the agent
        console.log("Detected wallet creation request, handling directly");
        const walletResult = await createNewAptosWallet();
        
        // Format a nice response
        const response = `I've created a new Aptos wallet for you:

**Address:** ${walletResult.address}

**Private Key:** ${walletResult.privateKey}

**Important:** Store this private key securely and never share it with anyone. It provides full control over your wallet.

The account is currently empty. ${network !== Network.MAINNET ? 
`On ${network}, you can use the faucet to get test tokens by asking me to "fund this account from the faucet".` : 
`On MAINNET, you'll need to transfer real APT tokens to this address to use it.`}`;

        // Return the response directly
        const textEncoder = new TextEncoder();
        const stream = new ReadableStream({
          start(controller) {
            controller.enqueue(textEncoder.encode(response));
            controller.close();
          }
        });
        
        return new Response(stream);
      } catch (error) {
        console.error("Direct wallet creation error:", error);
        return new Response(
          `I encountered an error while creating a new wallet: ${error instanceof Error ? error.message : "Unknown error"}. Please try again.`
        );
      }
    }

    // For non-wallet creation requests, proceed with OpenAI directly
    // Initialize Aptos configuration with the specified network
    const aptosConfig = new AptosConfig({
      network: network,
    })

    const aptos = new Aptos(aptosConfig)

    // Validate and get private key from environment
    const privateKeyStr = process.env.APTOS_PRIVATE_KEY
    if (!privateKeyStr) {
      throw new Error("Missing APTOS_PRIVATE_KEY environment variable")
    }

    // Setup account and signer
    const privateKey = new Ed25519PrivateKey(PrivateKey.formatPrivateKey(privateKeyStr, PrivateKeyVariants.Ed25519))
    const account = Account.fromPrivateKey({ privateKey })

    const signer = new LocalSigner(account, network)
    const aptosAgent = new AgentRuntime(signer, aptos, {
      PANORA_API_KEY: process.env.PANORA_API_KEY,
    })
    
    // Use the custom tools
    const tools = createCustomAptosTools(aptosAgent)

    // Create a system message with the context
    const systemMessage = {
      role: "system", 
      content: `
        You are a helpful Aptos blockchain assistant. You can help with:
        
        - Funding accounts on testnet/devnet using the fund_from_faucet tool
        - Transferring APT tokens between accounts using the transfer_apt tool
        - Explaining how the Aptos blockchain works
        - Providing information about APT tokens
        
        Note: To create a new wallet, users should directly ask "create a wallet" which is handled separately.
        
        Always remind users that:
        - Private keys should never be shared
        - APT tokens have 8 decimal places
        - Different networks (MAINNET/TESTNET/DEVNET) have different purposes

        Currently connected to: ${network} network.
      `
    };

    try {
      // Call OpenAI API directly with streaming
      const completion = await openai.chat.completions.create({
        model: "gpt-4-turbo",
        messages: [systemMessage, ...messages],
        temperature: 0.7,
        tools: tools.map(tool => ({
          type: tool.type as "function",
          function: tool.function
        })),
        stream: true
      });

      // Create response stream
      const textEncoder = new TextEncoder();
      const stream = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of completion) {
              // Process each chunk of the response
              if (chunk.choices[0]?.delta?.content) {
                controller.enqueue(textEncoder.encode(chunk.choices[0].delta.content));
              }
              
              // We'll handle tool calls in a simplified way for now
              // In a more complete implementation, you'd process tool calls more fully
            }
            controller.close();
          } catch (error) {
            console.error("Stream processing error:", error);
            controller.enqueue(textEncoder.encode("I encountered an error processing your request. Please try again with a different question."));
            controller.close();
          }
        }
      });

      return new Response(stream);
    } catch (error) {
      console.error("OpenAI API error:", error);
      return new Response(
        "I'm having trouble connecting to the AI service. Please try again later."
      );
    }
  } catch (error: any) {
    console.error("Request error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "An error occurred",
        status: "error",
      },
      { status: 500 }
    );
  }
}