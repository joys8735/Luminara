// constants/predictionsABI.ts
export const PREDICTIONS_ABI = [
  // Ставки
  "function betWithBNB(uint256 _predictionId, uint8 _outcome) external payable",
  "function betWithUSDT(uint256 _predictionId, uint8 _outcome, uint256 _amount) external",
  
  // Прогнози
  "function createPrediction(string memory _title, string memory _description, string memory _category, string memory _resolutionSource, uint256 _duration, uint256 _entryFee, uint256 _minBet, uint256 _maxBet) external payable returns (uint256)",
  "function lockPrediction(uint256 _predictionId) external",
  "function settlePrediction(uint256 _predictionId, uint8 _result, uint256 _resolvedValue) external",
  
  // Виграші
  "function claimWinnings(uint256 _predictionId) external",
  
  // Читання
  "function getActivePredictions() external view returns (tuple(uint256 id, string title, string description, uint256 upPool, uint256 downPool, uint256 drawPool, uint256 totalPool, uint256 entryFee, uint256 minBet, uint256 maxBet, uint256 lockTime, uint256 endTime, uint8 result, uint8 status, address creator, string category, string resolutionSource, uint256 resolvedValue, uint256 createdAt)[])",
  "function getPredictionsByCategory(string memory _category) external view returns (tuple(uint256 id, string title, string description, uint256 upPool, uint256 downPool, uint256 drawPool, uint256 totalPool, uint256 entryFee, uint256 minBet, uint256 maxBet, uint256 lockTime, uint256 endTime, uint8 result, uint8 status, address creator, string category, string resolutionSource, uint256 resolvedValue, uint256 createdAt)[])",
  "function getUserBets(address _user) external view returns (tuple(address better, uint256 amount, uint8 prediction, uint256 timestamp, bool claimed)[], uint256[])",
  
  // Статистика
  "function userStats(address) external view returns (uint256 totalBets, uint256 wins, uint256 losses, uint256 totalWagered, uint256 totalWon, uint256 totalLost)",
  
  // Події
  "event PredictionCreated(uint256 indexed predictionId, address indexed creator, string title, uint256 lockTime, uint256 endTime, uint256 entryFee)",
  "event BetPlaced(uint256 indexed predictionId, address indexed better, uint256 amount, uint8 prediction, uint256 timestamp)",
  "event PredictionSettled(uint256 indexed predictionId, uint8 result, uint256 resolvedValue, uint256 totalPool)",
  "event WinningsClaimed(uint256 indexed predictionId, address indexed winner, uint256 amount)"
];

export const PREDICTIONS_ADDRESS = "0x..."; // Ваша адреса контракту