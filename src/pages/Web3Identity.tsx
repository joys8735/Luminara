import { useState } from "react";
import { Send, Bot, User, Loader2, Key, Globe } from "lucide-react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

type ApiConfig = {
  name: string;
  url: string;
  requiresAuth: boolean;
};

export default function AIChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedApi, setSelectedApi] = useState<"openai" | "deepseek">("deepseek");
  const [showApiSelector, setShowApiSelector] = useState(false);

  const API_CONFIGS: Record<"openai" | "deepseek", ApiConfig> = {
    openai: {
      name: "OpenAI (Requires Login)",
      url: "http://localhost:4000/api/ai/chat",
      requiresAuth: true,
    },
    deepseek: {
      name: "DeepSeek (No Login)",
      url: "http://localhost:4001/api/ai/chat", // Змінив на порт 4001
      requiresAuth: false,
    },
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const config = API_CONFIGS[selectedApi];
      
      console.log(`📤 Sending to ${selectedApi}:`, input.substring(0, 50));
      
      const fetchOptions: RequestInit = {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: input }),
      };

      // Додаємо credentials тільки якщо потрібна авторизація
      if (config.requiresAuth) {
        fetchOptions.credentials = "include";
        fetchOptions.headers = {
          ...fetchOptions.headers,
          "X-Requested-With": "XMLHttpRequest"
        };
      }

      const res = await fetch(config.url, fetchOptions);
      
      console.log(`📥 Response status: ${res.status} from ${selectedApi}`);

      if (!res.ok) {
        let errorMessage = `HTTP error! status: ${res.status}`;
        try {
          const errorData = await res.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch (e) {
          // Не JSON response
        }
        
        if (res.status === 401 && selectedApi === "openai") {
          errorMessage = "⚠️ Please login via Google to use OpenAI";
        }
        
        throw new Error(errorMessage);
      }

      const data = await res.json();
      console.log(`✅ AI response from ${selectedApi}`);

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply },
      ]);
    } catch (e: any) {
      console.error(`❌ Error from ${selectedApi}:`, e.message);
      
      let errorMessage = e.message || "Something went wrong";
      
      // Користувачеві показати зрозуміліше повідомлення
      if (errorMessage.includes("Failed to fetch") || errorMessage.includes("NetworkError")) {
        errorMessage = `❌ Cannot connect to ${selectedApi} server. Make sure it's running on port ${selectedApi === 'deepseek' ? '4001' : '4000'}`;
      }
      
      setMessages((prev) => [
        ...prev,
        { 
          role: "assistant", 
          content: errorMessage
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const testConnection = async (api: "openai" | "deepseek") => {
    const config = API_CONFIGS[api];
    try {
      const res = await fetch(config.url.replace('/chat', '/health'), {
        method: 'GET',
        headers: config.requiresAuth ? { 
          'X-Requested-With': 'XMLHttpRequest' 
        } : undefined,
        credentials: config.requiresAuth ? 'include' : undefined,
      });
      
      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [...prev, {
          role: "assistant",
          content: `✅ ${api.toUpperCase()} server is running: ${data.status || 'OK'}`
        }]);
      } else {
        throw new Error(`Status: ${res.status}`);
      }
    } catch (e: any) {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: `❌ ${api.toUpperCase()} server is not responding (${e.message})`
      }]);
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-120px)] flex flex-col">

      {/* HEADER */}
      <div className="border-b border-[#1f1f1f] pb-3 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-lg font-semibold text-[#e0e0e0] flex items-center gap-2">
              <Bot className="w-5 h-5 text-[#3b82f6]" />
              AI Assistant
            </div>
            <div className="text-xs text-[#707070]">
              Ask anything about crypto, platform or strategy
              {/* <div className="flex gap-2 mt-1">
                <button
                  onClick={() => testConnection("deepseek")}
                  className="text-[10px] px-2 py-1 bg-[#1f1f1f] rounded hover:bg-[#2f2f2f]"
                >
                  Test DeepSeek
                </button>
                <button
                  onClick={() => testConnection("openai")}
                  className="text-[10px] px-2 py-1 bg-[#1f1f1f] rounded hover:bg-[#2f2f2f]"
                >
                  Test OpenAI
                </button>
              </div> */}
            </div>
          </div>
          
          <div className="relative">
            <button
              onClick={() => setShowApiSelector(!showApiSelector)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1a1a1a] border border-[#2f2f2f] hover:bg-[#2a2a2a] transition-colors"
            >
              <Globe className="w-4 h-4" />
              <span className="text-xs text-[#e0e0e0]">
                {API_CONFIGS[selectedApi].name}
              </span>
            </button>
            
            {showApiSelector && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowApiSelector(false)}
                />
                <div className="absolute right-0 top-full mt-1 z-50 w-48 bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg shadow-lg">
                  {Object.entries(API_CONFIGS).map(([key, config]) => (
                    <button
                      key={key}
                      onClick={() => {
                        setSelectedApi(key as "openai" | "deepseek");
                        setShowApiSelector(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-sm transition-colors flex items-center gap-2 ${
                        selectedApi === key
                          ? 'bg-[#3b82f6]/20 text-[#3b82f6]'
                          : 'text-[#a0a0a0] hover:bg-[#1a1a1a]'
                      }`}
                    >
                      {config.requiresAuth ? (
                        <Key className="w-3 h-3" />
                      ) : (
                        <Globe className="w-3 h-3" />
                      )}
                      {config.name}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* API INFO BANNER */}
      {/* {selectedApi === "openai" && (
        <div className="mb-4 p-3 rounded-xl bg-gradient-to-r from-[#3b82f6]/10 to-[#00d1ff]/10 border border-[#3b82f6]/20">
          <div className="flex items-center gap-2 text-xs text-[#3b82f6]">
            <Key className="w-3 h-3" />
            <span>Requires Google login • Port 4000</span>
          </div>
        </div>
      )} */}

      {selectedApi === "deepseek" && (
        <div className="mb-4 p-3 rounded-xl bg-gradient-to-r from-[#22c55e]/10 to-[#3b82f6]/10 border border-[#22c55e]/20">
          <div className="flex items-center gap-2 text-xs text-[#22c55e]">
            <Globe className="w-3 h-3" />
            <span>No login required • Port 4001 • Powered by DeepSeek AI</span>
          </div>
        </div>
      )}

      {/* CHAT */}
      <div className="flex-1 overflow-y-auto mb-[60px] space-y-4 pr-2">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-[#3b82f6]/20 to-[#00d1ff]/20 border border-[#3b82f6]/30 flex items-center justify-center mb-4">
              <Bot className="w-8 h-8 text-[#3b82f6]" />
            </div>
            <div className="text-sm font-semibold text-[#e0e0e0] mb-2">
              Welcome to Alpha AI Assistant
            </div>
            <div className="text-xs text-[#707070] max-w-md">
              Ask me about:
              <div className="mt-2 grid grid-cols-2 gap-2">
                <div className="p-2 rounded-lg bg-[#0a0a0a] border border-[#1f1f1f] text-[10px]">
                  📈 "How do NFT boxes work?"
                </div>
                <div className="p-2 rounded-lg bg-[#0a0a0a] border border-[#1f1f1f] text-[10px]">
                  🎮 "What are Alpha Points?"
                </div>
                <div className="p-2 rounded-lg bg-[#0a0a0a] border border-[#1f1f1f] text-[10px]">
                  🎁 "Best crypto strategy?"
                </div>
                <div className="p-2 rounded-lg bg-[#0a0a0a] border border-[#1f1f1f] text-[10px]">
                  🔥 "Explain blockchain"
                </div>
              </div>
            </div>
          </div>
        ) : (
          messages.map((m, i) => (
            <div
              key={i}
              className={`flex gap-3 ${
                m.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {m.role === "assistant" && (
                <div className="w-8 h-8 rounded-full bg-[#1f1f1f] flex items-center justify-center">
                  <Bot className="w-4 h-4 text-[#3b82f6]" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                  m.role === "user"
                    ? "bg-[#3b82f6] text-white"
                    : "bg-[#0a0a0a] border border-[#1f1f1f] text-[#e0e0e0]"
                }`}
              >
                {m.content}
              </div>

              {m.role === "user" && (
                <div className="w-8 h-8 rounded-full bg-[#3b82f6] flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
          ))
        )}

        {loading && (
          <div className="flex gap-3 items-center text-[#707070] text-xs">
            <Loader2 className="w-4 h-4 animate-spin" />
            {selectedApi === "deepseek" ? "🤖 DeepSeek AI is thinking…" : "🧠 AI is thinking…"}
          </div>
        )}
      </div>

      {/* INPUT */}
      <div className="fixed bottom-12 w-[890px] left-[123vh] transform -translate-x-1/2 mt-4 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Ask something about crypto, NFT boxes, or strategy..."
          className="flex-1 rounded-xl bg-[#050816] border border-[#1f1f1f] px-4 py-3 text-sm text-[#e0e0e0] outline-none focus:border-[#3b82f6]/40"
        />

        <button
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          className="rounded-xl bg-gradient-to-r from-[#3b82f6] to-[#00d1ff] hover:opacity-90 px-4 flex items-center justify-center transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="w-4 h-4 text-white" />
        </button>
      </div>
    </div>
  );
}