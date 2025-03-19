export interface UserStats {
    timePlayed: string;
    highScore: number;
    cryptoInvested: number;
    currency: string;
    rank: number;
  }
  
  export interface GameType {
    id: string;
    title: string;
    description: string;
    image: string;
    category: string;
    userStats: UserStats;
  }
  
  export const games: GameType[] = [
    {
      id: "1",
      title: "Crypto Runner",
      description: "Endless runner with crypto rewards",
      image: "/games/game1.jpg",
      category: "action",
      userStats: {
        timePlayed: "12h 30m",
        highScore: 1563,
        cryptoInvested: 0.05,
        currency: "ETH",
        rank: 34
      }
    },
    {
      id: "2",
      title: "Blockchain Battles",
      description: "Strategic card game with NFT rewards",
      image: "/games/game2.jpg",
      category: "strategy",
      userStats: {
        timePlayed: "20h 45m",
        highScore: 2150,
        cryptoInvested: 0.2,
        currency: "ETH",
        rank: 12
      }
    },
    {
      id: "3",
      title: "NFT Racer",
      description: "Racing game where you can win NFTs",
      image: "/games/game3.jpg",
      category: "racing",
      userStats: {
        timePlayed: "8h 15m",
        highScore: 980,
        cryptoInvested: 0.08,
        currency: "ETH",
        rank: 56
      }
    },
    {
      id: "4",
      title: "Token Tetris",
      description: "Classic game with a crypto twist",
      image: "/games/game4.jpg",
      category: "puzzle",
      userStats: {
        timePlayed: "5h 20m",
        highScore: 14500,
        cryptoInvested: 0.02,
        currency: "ETH",
        rank: 89
      }
    },
    {
      id: "5",
      title: "Crypto Tycoon",
      description: "Build your own crypto empire",
      image: "/games/game5.jpg",
      category: "simulation",
      userStats: {
        timePlayed: "32h 10m",
        highScore: 5600000,
        cryptoInvested: 0.15,
        currency: "ETH",
        rank: 7
      }
    },
    {
      id: "6",
      title: "Blockchain Brawlers",
      description: "Fighting game with blockchain mechanics",
      image: "/games/game6.jpg",
      category: "fighting",
      userStats: {
        timePlayed: "18h 45m",
        highScore: 2800,
        cryptoInvested: 0.12,
        currency: "ETH",
        rank: 21
      }
    },
    {
      id: "7",
      title: "Crypto Crush",
      description: "Match-3 puzzle game with token rewards",
      image: "/games/game7.jpg",
      category: "puzzle",
      userStats: {
        timePlayed: "14h 15m",
        highScore: 22500,
        cryptoInvested: 0.03,
        currency: "ETH",
        rank: 45
      }
    },
    {
      id: "8",
      title: "Metaverse Miner",
      description: "Mine virtual resources in the metaverse",
      image: "/games/game8.jpg",
      category: "simulation",
      userStats: {
        timePlayed: "27h 40m",
        highScore: 12400,
        cryptoInvested: 0.18,
        currency: "ETH",
        rank: 15
      }
    },
    {
      id: "9",
      title: "DeFi Defenders",
      description: "Tower defense with DeFi mechanics",
      image: "/games/game9.jpg",
      category: "strategy",
      userStats: {
        timePlayed: "16h 50m",
        highScore: 850,
        cryptoInvested: 0.07,
        currency: "ETH",
        rank: 28
      }
    }
  ];