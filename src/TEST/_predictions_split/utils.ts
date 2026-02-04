function formatPriceSmart(price: number): string {
function formatPriceForToken(price: number, symbol: string): string {
function alphaRiskFromPair(pair: Pair | null): AlphaRisk {
function alphaRiskMult(level: AlphaRisk) {
function getAlphaRank(ap: number) {
function updateHiddenMMR(
function calcAlphaPoints(
function formatVolume(raw: number): string {
function loadLS<T>(key: string, fallback: T): T {
function saveLS<T>(key: string, value: T) {
function normalizeAlphaHistory(raw: any[]): any[] {
function getDayKey(ms = Date.now()): string {
function getExtraStats(pair: Pair | null): ExtraStats {
function getAiSignal(pair: Pair | null, stats: ExtraStats): AiSignal {
function getPersonality(history: SettledBet[]): {
const calculateLivePnL = (bet: Bet, currentPrice: number) => {
const calculateLivePnL = (bet: Bet, currentPrice: number) => {
export * from './utils';
