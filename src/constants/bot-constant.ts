export type Bot = {
    id: string;
    name: string;
    description: string;
    category: string;
    username: string;
    rating: number;
    users: number;
    image: string;
    featured?: boolean;
    new?: boolean;
    price?: string;
    tags: string[];
  };
  
  export const CATEGORIES = [
    "All Categories",
    "Content Creation",
    "Productivity",
    "Development",
    "News",
    "Utilities",
    "Entertainment",
    "AI Assistants",
    "Finance",
    "Education"
  ];
  
  export const BOTS: Bot[] = [
    {
      id: "1",
      name: "MemeWizard",
      description: "Create hilarious memes with simple text commands. Supports multiple meme templates and custom image uploads.",
      category: "Content Creation",
      username: "@memewizard_bot",
      rating: 4.8,
      users: 78500,
      image: "/bots/meme-wizard.png",
      featured: true,
      tags: ["memes", "humor", "images"]
    },
    {
      id: "2",
      name: "TaskMaster",
      description: "Personal assistant that helps you manage tasks, set reminders, and organize your daily schedule.",
      category: "Productivity",
      username: "@taskmaster_bot",
      rating: 4.6,
      users: 65200,
      image: "/bots/task-master.png",
      featured: true,
      tags: ["tasks", "reminders", "productivity"]
    },
    {
      id: "3",
      name: "CodeHelper",
      description: "Get coding help, debug issues, and learn programming concepts through interactive chat.",
      category: "Development",
      username: "@codehelper_bot",
      rating: 4.7,
      users: 42800,
      image: "/bots/code-helper.png",
      tags: ["coding", "programming", "development"]
    },
    {
      id: "4",
      name: "NewsDigest",
      description: "Get personalized news updates based on your interests, delivered daily or weekly.",
      category: "News",
      username: "@newsdigest_bot",
      rating: 4.5,
      users: 38900,
      image: "/bots/news-digest.png",
      tags: ["news", "updates", "information"]
    },
    {
      id: "5",
      name: "TranslateNow",
      description: "Instantly translate text between 50+ languages with accurate results.",
      category: "Utilities",
      username: "@translatenow_bot",
      rating: 4.9,
      users: 92600,
      image: "/bots/translate-now.png",
      featured: true,
      tags: ["translation", "languages", "communication"]
    },
    {
      id: "6",
      name: "StoryTeller",
      description: "AI-powered bot that creates custom stories based on your prompts and preferences.",
      category: "Entertainment",
      username: "@storyteller_bot",
      rating: 4.4,
      users: 31200,
      image: "/bots/story-teller.png",
      tags: ["stories", "creativity", "entertainment"]
    },
    {
      id: "7",
      name: "StickerMaker",
      description: "Convert your photos into custom Telegram stickers with various effects.",
      category: "Content Creation",
      username: "@stickermaker_bot",
      rating: 4.6,
      users: 52300,
      image: "/bots/sticker-maker.png",
      tags: ["stickers", "images", "customization"]
    },
    {
      id: "8",
      name: "QuizMaster",
      description: "Challenge yourself with trivia across various categories. Play solo or compete with friends.",
      category: "Entertainment",
      username: "@quizmaster_bot",
      rating: 4.3,
      users: 27800,
      image: "/bots/quiz-master.png",
      tags: ["quiz", "trivia", "games"]
    },
    {
      id: "9",
      name: "AITutor",
      description: "Personal AI tutor that helps with homework, explains concepts, and provides practice exercises.",
      category: "Education",
      username: "@aitutor_bot",
      rating: 4.7,
      users: 45600,
      new: true,
      price: "Free",
      tags: ["education", "learning", "tutoring"]
    },
    {
      id: "10",
      name: "FinanceGuru",
      description: "Track expenses, get investment advice, and receive financial insights tailored to your goals.",
      category: "Finance",
      username: "@financeguru_bot",
      rating: 4.5,
      users: 33400,
      new: true,
      tags: ["finance", "investments", "budgeting"]
    },
    {
      id: "11",
      name: "HealthyHabits",
      description: "Build and maintain healthy habits with personalized reminders, tracking, and motivation.",
      category: "Productivity",
      username: "@healthyhabits_bot",
      rating: 4.4,
      users: 28900,
      new: true,
      tags: ["health", "habits", "wellness"]
    },
    {
      id: "12",
      name: "MovieRecommender",
      description: "Get personalized movie and TV show recommendations based on your preferences and viewing history.",
      category: "Entertainment",
      username: "@movierecommender_bot",
      rating: 4.6,
      users: 41200,
      tags: ["movies", "recommendations", "entertainment"]
    },
    {
      id: "13",
      name: "AIArtist",
      description: "Generate beautiful artwork and illustrations from text descriptions using advanced AI.",
      category: "Content Creation",
      username: "@aiartist_bot",
      rating: 4.8,
      users: 68700,
      featured: true,
      tags: ["art", "images", "creativity"]
    },
    {
      id: "14",
      name: "LanguageLearner",
      description: "Learn new languages through interactive conversations, exercises, and personalized lessons.",
      category: "Education",
      username: "@languagelearner_bot",
      rating: 4.7,
      users: 54300,
      featured: true,
      tags: ["languages", "learning", "education"]
    },
    {
      id: "15",
      name: "GPT Assistant",
      description: "Advanced AI assistant powered by GPT-4 that can answer questions, write content, and more.",
      category: "AI Assistants",
      username: "@gptassistant_bot",
      rating: 4.9,
      users: 120500,
      featured: true,
      tags: ["ai", "assistant", "writing"]
    }
  ];