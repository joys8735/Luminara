// Sports API Service using The Odds API
// Docs: https://the-odds-api.com/

export interface SportsEvent {
  id: string;
  sport_key: string;
  sport_title: string;
  commence_time: string;
  home_team: string;
  away_team: string;
  bookmakers: Array<{
    key: string;
    title: string;
    markets: Array<{
      key: string;
      outcomes: Array<{
        name: string;
        price: number;
      }>;
    }>;
  }>;
}

export interface TeamStats {
  team: string;
  wins: number;
  losses: number;
  draws: number;
  form: string[]; // ['W', 'L', 'W', 'D', 'W']
  goalsScored: number;
  goalsConceded: number;
}

export interface H2HStats {
  homeWins: number;
  awayWins: number;
  draws: number;
  lastMatches: Array<{
    date: string;
    homeScore: number;
    awayScore: number;
    winner: 'home' | 'away' | 'draw';
  }>;
}

class SportsAPIService {
  private apiKey: string;
  private baseUrl = 'https://api.the-odds-api.com/v4';
  
  constructor() {
    // Використовуй свій API key з .env
    this.apiKey = (import.meta as any).env?.VITE_ODDS_API_KEY || '';
  }

  // Отримати список доступних спортів
  async getSports() {
    try {
      const response = await fetch(`${this.baseUrl}/sports?apiKey=${this.apiKey}`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching sports:', error);
      return [];
    }
  }

  // Отримати події для конкретного спорту
  async getEvents(sportKey: string = 'soccer_epl') {
    try {
      const response = await fetch(
        `${this.baseUrl}/sports/${sportKey}/odds?apiKey=${this.apiKey}&regions=eu&markets=h2h&oddsFormat=decimal`
      );
      const data = await response.json();
      return data as SportsEvent[];
    } catch (error) {
      console.error('Error fetching events:', error);
      return [];
    }
  }

  // Отримати коефіцієнти для події
  async getOdds(sportKey: string, eventId: string) {
    try {
      const response = await fetch(
        `${this.baseUrl}/sports/${sportKey}/events/${eventId}/odds?apiKey=${this.apiKey}&regions=eu&markets=h2h`
      );
      return await response.json();
    } catch (error) {
      console.error('Error fetching odds:', error);
      return null;
    }
  }

  // Mock функція для статистики команд (потрібен окремий API)
  async getTeamStats(teamName: string): Promise<TeamStats> {
    // TODO: Інтегрувати з API-Football або SportRadar
    return {
      team: teamName,
      wins: Math.floor(Math.random() * 20),
      losses: Math.floor(Math.random() * 10),
      draws: Math.floor(Math.random() * 5),
      form: ['W', 'W', 'L', 'W', 'D'].slice(0, 5),
      goalsScored: Math.floor(Math.random() * 50),
      goalsConceded: Math.floor(Math.random() * 30),
    };
  }

  // Mock функція для H2H статистики
  async getH2HStats(homeTeam: string, awayTeam: string): Promise<H2HStats> {
    // TODO: Інтегрувати з API-Football або SportRadar
    return {
      homeWins: Math.floor(Math.random() * 5),
      awayWins: Math.floor(Math.random() * 5),
      draws: Math.floor(Math.random() * 3),
      lastMatches: [
        {
          date: '2024-01-15',
          homeScore: 2,
          awayScore: 1,
          winner: 'home',
        },
        {
          date: '2023-09-20',
          homeScore: 1,
          awayScore: 1,
          winner: 'draw',
        },
      ],
    };
  }

  // Конвертувати події в формат для UI
  convertToUIFormat(events: SportsEvent[]) {
    return events.map((event, index) => {
      const homeOdds = event.bookmakers[0]?.markets[0]?.outcomes.find(
        o => o.name === event.home_team
      )?.price || 2.0;
      
      const awayOdds = event.bookmakers[0]?.markets[0]?.outcomes.find(
        o => o.name === event.away_team
      )?.price || 2.0;

      const avgOdds = (homeOdds + awayOdds) / 2;
      const change = ((homeOdds - awayOdds) / avgOdds) * 100;

      return {
        id: 101 + index,
        name: `${event.home_team} vs ${event.away_team}`,
        symbol: event.sport_key.toUpperCase(),
        change: change,
        price: avgOdds,
        logo: 'sport',
        mult: 2.0 + Math.random() * 0.5,
        homeTeam: event.home_team,
        awayTeam: event.away_team,
        homeOdds,
        awayOdds,
        commenceTime: event.commence_time,
        sportTitle: event.sport_title,
      };
    });
  }
}

export const sportsAPI = new SportsAPIService();
