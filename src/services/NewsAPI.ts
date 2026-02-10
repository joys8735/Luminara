// News API Service
// Docs: https://newsapi.org/docs

export interface NewsArticle {
  source: {
    id: string | null;
    name: string;
  };
  author: string | null;
  title: string;
  description: string;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  content: string;
}

export interface CryptoNews {
  id: string;
  title: string;
  description: string;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  impact: 'high' | 'medium' | 'low';
  source: string;
  publishedAt: string;
  relatedAssets: string[];
}

class NewsAPIService {
  private apiKey: string;
  private baseUrl = 'https://newsapi.org/v2';
  private coinGeckoUrl = 'https://api.coingecko.com/api/v3';
  
  constructor() {
    this.apiKey = (import.meta as any).env?.VITE_NEWS_API_KEY || '';
  }

  // Отримати топ новини
  async getTopHeadlines(category: string = 'business', country: string = 'us') {
    try {
      const response = await fetch(
        `${this.baseUrl}/top-headlines?category=${category}&country=${country}&apiKey=${this.apiKey}`
      );
      const data = await response.json();
      return data.articles as NewsArticle[];
    } catch (error) {
      console.error('Error fetching news:', error);
      return [];
    }
  }

  // Пошук новин по ключовим словам
  async searchNews(query: string) {
    try {
      const response = await fetch(
        `${this.baseUrl}/everything?q=${query}&sortBy=publishedAt&apiKey=${this.apiKey}`
      );
      const data = await response.json();
      return data.articles as NewsArticle[];
    } catch (error) {
      console.error('Error searching news:', error);
      return [];
    }
  }

  // Отримати крипто новини з CoinGecko (безкоштовно)
  async getCryptoNews() {
    try {
      // CoinGecko не має прямого API для новин, але можна використати trending
      const response = await fetch(`${this.coinGeckoUrl}/search/trending`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching crypto news:', error);
      return null;
    }
  }

  // Аналіз sentiment (простий алгоритм)
  analyzeSentiment(text: string): 'bullish' | 'bearish' | 'neutral' {
    const bullishWords = ['surge', 'rally', 'gain', 'rise', 'up', 'positive', 'growth', 'bull', 'increase'];
    const bearishWords = ['crash', 'fall', 'drop', 'decline', 'down', 'negative', 'loss', 'bear', 'decrease'];
    
    const lowerText = text.toLowerCase();
    let bullishCount = 0;
    let bearishCount = 0;

    bullishWords.forEach(word => {
      if (lowerText.includes(word)) bullishCount++;
    });

    bearishWords.forEach(word => {
      if (lowerText.includes(word)) bearishCount++;
    });

    if (bullishCount > bearishCount) return 'bullish';
    if (bearishCount > bullishCount) return 'bearish';
    return 'neutral';
  }

  // Визначити рівень впливу
  determineImpact(article: NewsArticle): 'high' | 'medium' | 'low' {
    const highImpactSources = ['Reuters', 'Bloomberg', 'CNBC', 'Financial Times'];
    const highImpactKeywords = ['fed', 'federal reserve', 'regulation', 'sec', 'bitcoin', 'ethereum'];
    
    const isHighImpactSource = highImpactSources.some(source => 
      article.source.name.toLowerCase().includes(source.toLowerCase())
    );

    const hasHighImpactKeyword = highImpactKeywords.some(keyword =>
      article.title.toLowerCase().includes(keyword) || 
      article.description?.toLowerCase().includes(keyword)
    );

    if (isHighImpactSource || hasHighImpactKeyword) return 'high';
    if (article.source.name.includes('Crypto') || article.source.name.includes('Coin')) return 'medium';
    return 'low';
  }

  // Конвертувати новини в формат для UI
  async convertToUIFormat(articles: NewsArticle[]) {
    return articles.slice(0, 8).map((article, index) => {
      const sentiment = this.analyzeSentiment(article.title + ' ' + (article.description || ''));
      const impact = this.determineImpact(article);
      
      const sentimentScore = sentiment === 'bullish' ? 2.5 : sentiment === 'bearish' ? -2.5 : 0;
      const impactMultiplier = impact === 'high' ? 1.5 : impact === 'medium' ? 1.2 : 1.0;

      return {
        id: 201 + index,
        name: article.title.slice(0, 60) + (article.title.length > 60 ? '...' : ''),
        symbol: `NEWS_${index + 1}`,
        change: sentimentScore * impactMultiplier,
        price: sentiment === 'bullish' ? 2.5 : sentiment === 'bearish' ? 1.5 : 2.0,
        logo: 'news',
        mult: 2.1 + Math.random() * 0.4,
        sentiment,
        impact,
        source: article.source.name,
        publishedAt: article.publishedAt,
        description: article.description || '',
        url: article.url,
        imageUrl: article.urlToImage,
      };
    });
  }

  // Отримати крипто-специфічні новини
  async getCryptoMarketNews() {
    const queries = ['bitcoin', 'ethereum', 'cryptocurrency', 'crypto regulation', 'defi'];
    const allNews: NewsArticle[] = [];

    for (const query of queries) {
      const news = await this.searchNews(query);
      allNews.push(...news.slice(0, 2));
    }

    return this.convertToUIFormat(allNews);
  }

  // Отримати фінансові новини
  async getFinancialNews() {
    const articles = await this.getTopHeadlines('business');
    return this.convertToUIFormat(articles);
  }
}

export const newsAPI = new NewsAPIService();
