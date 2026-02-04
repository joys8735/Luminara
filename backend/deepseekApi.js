import express from "express";
import dotenv from "dotenv";
import axios from "axios";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = express();
const PORT = process.env.AI_PORT || 4001;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

// Налаштування всіх AI провайдерів
const AI_PROVIDERS = {
  openai: {
    name: "OpenAI",
    key: process.env.OPENAI_API_KEY,
    model: "gpt-3.5-turbo",
    url: "https://api.openai.com/v1/chat/completions",
    priority: 1,
    enabled: false, // Вимикаємо поки що
  },
  gemini: {
    name: "Google Gemini",
    key: process.env.GEMINI_API_KEY,
    model: "gemini-pro",
    priority: 2,
    enabled: false, // Потребує оновлення API
  },
  deepseek: {
    name: "DeepSeek",
    key: process.env.DEEPSEEK_API_KEY,
    model: "deepseek-chat",
    url: "https://api.deepseek.com/v1/chat/completions",
    priority: 3,
    enabled: false, // Недостатньо балансу
  },
  local: {
    name: "Local AI Brain",
    key: "none",
    model: "local-v1",
    priority: 0, // Найвищий пріоритет - завжди доступний
    enabled: true,
  }
};

// Локальна база знань про платформу Alpha (розширена)
const PLATFORM_KNOWLEDGE = {
  platformName: "Alpha Web3 Platform",
  description: "A cutting-edge Web3 platform for NFT collectors and crypto enthusiasts",
  features: [
    {
      name: "Daily Rewards",
      description: "Claim Alpha Points (AP) daily. Streaks increase rewards: Day 1-50 AP, Day 7-500 AP",
      emoji: "🎁",
    },
    {
      name: "NFT Boxes",
      description: "Four tiers: Common (100 AP), Rare (300 AP), Epic (750 AP), Legendary (1500 AP)",
      emoji: "📦",
    },
    {
      name: "NFT Collection",
      description: "Collect unique 16:9 NFT cards with stunning artwork",
      emoji: "🖼️",
    },
    {
      name: "Alpha Points (AP)",
      description: "Platform currency earned from daily rewards",
      emoji: "⭐",
    },
    {
      name: "Streak System",
      description: "Daily login bonus system with streak freezes",
      emoji: "🔥",
    },
  ],
  nftRarities: {
    Common: "Basic NFTs with common artwork",
    Rare: "Better NFTs with unique designs",
    Epic: "Premium NFTs with special effects",
    Legendary: "Ultra rare NFTs with exclusive artwork",
  },
  tips: [
    "Connect your wallet first to start earning AP",
    "Claim daily rewards every 24 hours to maintain your streak",
    "Save AP for Epic and Legendary boxes - better rewards!",
    "Collect NFTs to build your digital collection",
    "Use streak freezes if you might miss a day",
  ],
  faq: [
    "Q: How do I get started? A: Connect wallet → Claim daily AP → Open boxes → Collect NFTs",
    "Q: What are Alpha Points? A: Platform currency earned daily, used to open NFT boxes",
    "Q: What's in NFT boxes? A: Unique NFT cards, boost cards, and special rewards",
    "Q: How do streaks work? A: Claim daily for 7 days max reward. Miss a day = 50% streak loss",
  ],
};

// Розширений локальний AI мозок
const LOCAL_AI_BRAIN = {
  greetings: [
    "👋 Привіт! Я Alpha AI - твій помічник у світі Web3 та NFT!",
    "🚀 Вітаю на платформі Alpha! Готовий досліджувати криптосвіт?",
    "💎 Привіт! Запитай мене про NFT скриньки, Alpha Points чи криптотрейдинг!",
    "🎮 Привіт, Alpha Explorer! Як я можу допомогти тобі сьогодні?",
  ],
  
  platform: [
    "🎮 Alpha платформа має: Daily Rewards, NFT Boxes, Alpha Points систему та NFT колекцію!",
    "📦 NFT скриньки: Common (100 AP), Rare (300 AP), Epic (750 AP), Legendary (1500 AP)!",
    "💰 Заробляй Alpha Points щодня для відкриття унікальних NFT скриньок!",
  ],
  
  nft: [
    "🎨 NFT на Alpha - це красиві 16:9 цифрові колекційні картки!",
    "✨ Система рідкості: Common → Rare → Epic → Legendary (найцінніші)!",
    "🖼️ Кожна NFT скринька містить ексклюзивні арт-роботи - колекціонуй їх усі!",
  ],
  
  ap: [
    "⭐ Alpha Points (AP) - це валюта платформи, яку ти заробляєш щодня!",
    "🎯 Щоденна нагорода AP: від 50 до 500 в залежності від стрика (до 7 днів)!",
    "💳 Витрачай AP розумно - зберігай для Epic/Legendary скриньок!",
  ],
  
  crypto: [
    "📈 Почни з Bitcoin та Ethereum, потім досліджуй перспективні альткоїни!",
    "🔐 Безпека понад усе: використовуй апаратні гаманці, вмикай 2FA, ніколи не ділись seed-фразами!",
    "💡 DCA (Dollar Cost Averaging) - розумна стратегія для довгострокових інвестицій!",
  ],
  
  web3: [
    "🔗 Web3 = Децентралізований інтернет з крипто, NFT, DeFi та DAO!",
    "🎯 Blockchain забезпечує прозорість, безпеку та контроль користувача!",
    "🚀 Alpha будує майбутнє Web3 геймінгу та колекцій!",
  ],
  
  trading: [
    "📊 Завжди роби власне дослідження (DYOR) перед інвестиціями!",
    "🎯 Встановлюй стоп-лосси та тейк-профіти для контролю ризиків!",
    "💎 Не піддавайся FOMO (страху пропустити) - дотримуйся своєї стратегії!",
  ],
  
  help: [
    "🆘 Потрібна допомога? Спробуй: 'Як почати?', 'Що таке AP?', 'Як працюють NFT скриньки?'",
    "❓ Задай питання про: криптовалюту, NFT, Alpha платформу чи інвестиції!",
    "💡 Порада: Почни з щоденного клейму AP та відкриття Common скриньок!",
  ],
  
  default: [
    "🤔 Цікаве питання! Дай-но подумати над відповіддю...",
    "💭 Хм, хороше запитання! На платформі Alpha ми фокусуємось на...",
    "🎯 Чудове питання! Ключовий момент у Web3 це...",
    "🚀 Відмінне питання! Давай розглянемо це детальніше...",
  ],
};

// CORS middleware
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", FRONTEND_URL);
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.header("Access-Control-Allow-Credentials", "true");
  
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  
  next();
});

app.use(express.json());

// Простий middleware для логування
app.use((req, res, next) => {
  console.log(`${new Date().toISOString().split('T')[1].split('.')[0]} ${req.method} ${req.path}`);
  next();
});

// ==================== ROUTES ====================

// Кореневий маршрут
app.get("/", (req, res) => {
  const activeProviders = Object.values(AI_PROVIDERS)
    .filter(p => p.enabled)
    .map(p => ({ name: p.name, model: p.model }));
  
  res.json({
    service: "Alpha AI Assistant API",
    version: "2.1.0",
    status: "🟢 Operational",
    note: "Using Local AI Brain (no API keys required)",
    endpoints: {
      chat: "POST /api/ai/chat",
      health: "GET /api/health",
      providers: "GET /api/providers",
    },
    providers: {
      available: activeProviders,
      primary: "Local AI Brain",
    },
    platform: {
      name: PLATFORM_KNOWLEDGE.platformName,
      features: PLATFORM_KNOWLEDGE.features.length,
      localResponses: Object.values(LOCAL_AI_BRAIN).flat().length,
    },
  });
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    service: "Alpha AI Assistant",
    primaryProvider: "Local AI Brain",
    localKnowledge: {
      responses: Object.values(LOCAL_AI_BRAIN).flat().length,
      categories: Object.keys(LOCAL_AI_BRAIN).length,
    },
    externalProviders: {
      openai: AI_PROVIDERS.openai.enabled && AI_PROVIDERS.openai.key ? "available" : "disabled",
      gemini: AI_PROVIDERS.gemini.enabled && AI_PROVIDERS.gemini.key ? "available" : "disabled",
      deepseek: AI_PROVIDERS.deepseek.enabled && AI_PROVIDERS.deepseek.key ? "available" : "disabled",
    },
    note: "Local AI Brain is always available, no API keys needed",
  });
});

// Список провайдерів
app.get("/api/providers", (req, res) => {
  const providers = Object.entries(AI_PROVIDERS).map(([key, config]) => ({
    id: key,
    name: config.name,
    enabled: config.enabled,
    hasKey: !!config.key,
    model: config.model,
    priority: config.priority,
    status: config.enabled ? "active" : "disabled",
  }));

  res.json({
    providers: providers.sort((a, b) => a.priority - b.priority),
    recommendation: {
      id: "local",
      name: "Local AI Brain",
      reason: "Always available, no API costs, knows Alpha platform",
    },
    stats: {
      totalResponses: Object.values(LOCAL_AI_BRAIN).flat().length,
      categories: Object.keys(LOCAL_AI_BRAIN).length,
    },
  });
});

// Основний AI чат ендпоінт
app.post("/api/ai/chat", async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { message, provider: requestedProvider } = req.body;
    
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ 
        error: "Message is required",
        reply: "Будь ласка, напиши своє питання!",
      });
    }
    
    console.log(`💬 AI запит: "${message.substring(0, 100)}"`);
    
    let reply;
    let providerUsed = "local";
    let providerDetails = { name: "Local AI Brain", model: "local-v1" };
    
    // Якщо запитується конкретний провайдер і він доступний
    if (requestedProvider && requestedProvider !== "local") {
      const config = AI_PROVIDERS[requestedProvider];
      if (config?.enabled && config?.key) {
        try {
          const result = await callExternalAI(config, message);
          if (result.success) {
            reply = result.reply;
            providerUsed = requestedProvider;
            providerDetails = result.details;
          } else {
            reply = getLocalAIReply(message);
          }
        } catch (error) {
          console.log(`❌ ${config.name} failed, using local AI`);
          reply = getLocalAIReply(message);
        }
      } else {
        reply = getLocalAIReply(message);
      }
    } else {
      // За замовчуванням використовуємо локальний AI мозок
      reply = getLocalAIReply(message);
    }
    
    const responseTime = Date.now() - startTime;
    
    res.json({
      reply,
      provider: {
        id: providerUsed,
        name: providerDetails.name,
        model: providerDetails.model,
        responseTime: `${responseTime}ms`,
      },
      timestamp: new Date().toISOString(),
      messageLength: message.length,
      replyLength: reply.length,
    });
    
  } catch (error) {
    console.error("❌ AI Chat Error:", error);
    
    // Fallback до локальної відповіді
    const fallbackReply = getLocalAIReply(req.body?.message || "help");
    
    res.status(200).json({
      reply: fallbackReply,
      provider: {
        id: "local",
        name: "Local AI Brain (Fallback)",
        model: "local-v1",
        note: "Using local knowledge base",
      },
      timestamp: new Date().toISOString(),
    });
  }
});

// ==================== AI FUNCTIONS ====================

async function callExternalAI(config, message) {
  if (config.name === "OpenAI") {
    return await callOpenAI(config, message);
  } else if (config.name === "Google Gemini") {
    return await callGemini(config, message);
  } else if (config.name === "DeepSeek") {
    return await callDeepSeek(config, message);
  }
  throw new Error(`Unknown provider: ${config.name}`);
}

async function callOpenAI(config, message) {
  try {
    const systemPrompt = `Ти Alpha AI, помічник Web3 платформи Alpha. 
Знай платформу: Daily Rewards, NFT Boxes, Alpha Points, NFT Collection.
Відповідай коротко, з емоціями, використовуй емодзі.`;
    
    const response = await axios.post(
      config.url,
      {
        model: config.model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message },
        ],
        temperature: 0.7,
        max_tokens: 300,
      },
      {
        headers: {
          "Authorization": `Bearer ${config.key}`,
          "Content-Type": "application/json",
        },
        timeout: 10000,
      }
    );
    
    if (response.data?.choices?.[0]?.message?.content) {
      return {
        success: true,
        reply: response.data.choices[0].message.content,
        details: {
          name: config.name,
          model: response.data.model,
        },
      };
    }
    throw new Error("Invalid response format");
  } catch (error) {
    console.error("OpenAI Error:", error.response?.data || error.message);
    throw error;
  }
}

async function callGemini(config, message) {
  try {
    // Оновлена версія Gemini API
    const genAI = new GoogleGenerativeAI(config.key);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const prompt = `Ти Alpha AI, помічник Web3 платформи.
${getPlatformContext()}

Питання: ${message}

Відповідь:`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    return {
      success: true,
      reply: text,
      details: {
        name: config.name,
        model: config.model,
      },
    };
  } catch (error) {
    console.error("Gemini Error:", error.message);
    throw error;
  }
}

async function callDeepSeek(config, message) {
  try {
    const response = await axios.post(
      config.url,
      {
        model: config.model,
        messages: [
          { 
            role: "system", 
            content: `Ти Alpha AI. ${getPlatformContext()} Відповідай українською/англійською.` 
          },
          { role: "user", content: message },
        ],
        temperature: 0.7,
        max_tokens: 300,
      },
      {
        headers: {
          "Authorization": `Bearer ${config.key}`,
          "Content-Type": "application/json",
        },
        timeout: 10000,
      }
    );
    
    if (response.data?.choices?.[0]?.message?.content) {
      return {
        success: true,
        reply: response.data.choices[0].message.content,
        details: {
          name: config.name,
          model: response.data.model,
        },
      };
    }
    throw new Error("Invalid response format");
  } catch (error) {
    console.error("DeepSeek Error:", error.response?.data || error.message);
    throw error;
  }
}

function getPlatformContext() {
  return `
ПЛАТФОРМА ALPHA:
• Daily Rewards: Щоденна нагорода Alpha Points (AP)
• NFT Boxes: Common (100 AP), Rare (300 AP), Epic (750 AP), Legendary (1500 AP)
• NFT Collection: Унікальні 16:9 цифрові колекції
• Alpha Points: Валюта платформи
• Streaks: Система послідовності до 7 днів

Будь допоміжним, ентузіастичним, використовуй емодзі 🎮🎨🚀💎✨`;
}

function getLocalAIReply(message) {
  const msg = message.toLowerCase().trim();
  
  // Перевірка на привітання
  if (msg.includes("привіт") || msg.includes("hello") || msg.includes("hi") || msg.includes("хай")) {
    return getRandomResponse(LOCAL_AI_BRAIN.greetings);
  }
  
  // Перевірка на допомогу
  if (msg.includes("допомог") || msg.includes("help") || msg.includes("як") || msg.includes("?")) {
    if (msg.includes("як поч") || msg.includes("get start") || msg.includes("почати")) {
      return "🚀 Щоб почати на Alpha: 1) Підключ гаманець 2) Клейми щоденну нагороду (AP) 3) Відкривай NFT скриньки 4) Колекціонуй NFT!";
    }
    if (msg.includes("ap") || msg.includes("alpha point") || msg.includes("очк")) {
      return getRandomResponse(LOCAL_AI_BRAIN.ap);
    }
    if (msg.includes("nft") || msg.includes("скринь") || msg.includes("бокс")) {
      return getRandomResponse(LOCAL_AI_BRAIN.nft);
    }
    return getRandomResponse(LOCAL_AI_BRAIN.help);
  }
  
  // Перевірка на платформу
  if (msg.includes("платформ") || msg.includes("alpha") || msg.includes("функці") || msg.includes("feature")) {
    return getRandomResponse(LOCAL_AI_BRAIN.platform);
  }
  
  // Перевірка на крипто
  if (msg.includes("крипт") || msg.includes("crypto") || msg.includes("bitcoin") || msg.includes("btc") || msg.includes("eth")) {
    return getRandomResponse(LOCAL_AI_BRAIN.crypto);
  }
  
  // Перевірка на трейдинг
  if (msg.includes("трейдинг") || msg.includes("trading") || msg.includes("інвест") || msg.includes("invest") || msg.includes("куп")) {
    return getRandomResponse(LOCAL_AI_BRAIN.trading);
  }
  
  // Перевірка на web3
  if (msg.includes("web3") || msg.includes("блокчейн") || msg.includes("blockchain") || msg.includes("децентраліз")) {
    return getRandomResponse(LOCAL_AI_BRAIN.web3);
  }
  
  // Дефолтна відповідь
  return getRandomResponse(LOCAL_AI_BRAIN.default);
}

function getRandomResponse(array) {
  const randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex];
}

// ==================== SERVER START ====================

app.listen(PORT, () => {
  console.log(`\n🚀 Alpha AI Assistant Server запущено!`);
  console.log(`📍 URL: http://localhost:${PORT}`);
  console.log(`🔌 Ендпоінт: POST http://localhost:${PORT}/api/ai/chat`);
  console.log(`📊 Статус: GET http://localhost:${PORT}/api/health\n`);
  
  console.log(`🤖 Статус AI провайдерів:`);
  console.log(`   🧠 Локальний AI мозок: ✅ Завжди доступний`);
  console.log(`   📦 Готових відповідей: ${Object.values(LOCAL_AI_BRAIN).flat().length}`);
  
  console.log(`\n🎮 База знань Alpha платформи:`);
  console.log(`   📋 Особливості: ${PLATFORM_KNOWLEDGE.features.length}`);
  console.log(`   🎨 Рідкості NFT: ${Object.keys(PLATFORM_KNOWLEDGE.nftRarities).length}`);
  console.log(`   💡 Поради: ${PLATFORM_KNOWLEDGE.tips.length}`);
  console.log(`   ❓ FAQ: ${PLATFORM_KNOWLEDGE.faq.length}`);
  
  console.log(`\n🌍 Готовий обробляти запити! Приклад:`);
  console.log(`   curl -X POST http://localhost:${PORT}/api/ai/chat \\`);
  console.log(`        -H "Content-Type: application/json" \\`);
  console.log(`        -d '{"message":"Привіт, як працюють NFT скриньки?"}'`);
});