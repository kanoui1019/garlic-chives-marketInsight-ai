
export interface Source {
  title: string;
  uri: string;
}

export interface NewsData {
  summary: string;
  sources: Source[];
}

export interface FinancialForecast {
  epsForecast: string;
  fairValue: string;
  currentPrice: string;
  upsidePotential: string;
  valuationMethod: string;
  analystConsensus: string; 
  dataVerification: string; 
}

export interface TechnicalAnalysis {
  signal: 'BUY' | 'SELL' | 'HOLD'; // Main signal
  signalContext: string; // e.g., "Golden Cross Confirmation" or "Granville Buy Signal #2"
  ma20: string; // 20-day Moving Average
  ma60: string; // 60-day Moving Average
  suggestedEntryZone: string; // e.g., "100.5 - 102.0"
  stopLossPrice: string; // e.g., "98.0"
  granvilleReasoning: string; // Explanation based on MA theory
}

export interface AnalysisData {
  content: string;
  financialForecast?: FinancialForecast;
  technicalAnalysis?: TechnicalAnalysis; // New field
}

export enum AppState {
  IDLE = 'IDLE',
  SEARCHING = 'SEARCHING',
  ANALYZING = 'ANALYZING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}
