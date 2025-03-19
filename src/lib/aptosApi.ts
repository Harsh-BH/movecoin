import { Network } from "@aptos-labs/ts-sdk";

export async function fetchAccountDetails(address: string, network: string = 'mainnet') {
  // Determine the API URL based on network
  const baseUrl = network === 'mainnet' 
    ? 'https://fullnode.mainnet.aptoslabs.com/v1'
    : network === 'testnet'
      ? 'https://fullnode.testnet.aptoslabs.com/v1'
      : 'https://fullnode.devnet.aptoslabs.com/v1';

  try {
    // Fetch account resources
    const resourcesResponse = await fetch(`${baseUrl}/accounts/${address}/resources`);
    const resources = await resourcesResponse.json();

    // Fetch account modules
    const modulesResponse = await fetch(`${baseUrl}/accounts/${address}/modules`);
    const modules = await modulesResponse.json();

    // Fetch account info
    const accountResponse = await fetch(`${baseUrl}/accounts/${address}`);
    const accountInfo = await accountResponse.json();

    // Process resources to extract coin balances
    const coins = resources
      .filter((resource: any) => resource.type.includes('0x1::coin::CoinStore<'))
      .map((coinResource: any) => {
        const typeMatch = coinResource.type.match(/CoinStore<([^>]+)>/);
        return {
          type: typeMatch ? typeMatch[1] : coinResource.type,
          balance: coinResource.data.coin.value,
        };
      });

    return {
      ...accountInfo,
      resources,
      modules,
      coins,
    };
  } catch (error) {
    console.error('Error fetching account data:', error);
    throw error;
  }
}