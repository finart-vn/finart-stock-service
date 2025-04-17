export interface RawHistoryEntry {
  symbol: string;
  o: number[];
  h: number[];
  l: number[];
  c: number[];
  v: number[];
  t: string[]; // Timestamps as strings
  accumulatedVolume: number[];
  accumulatedValue: number[];
  minBatchTruncTime: string;
}

export interface ReadableHistoryEntry {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface StockHistoryParams {
  symbols: string[];
  start: string;
  end?: string;
} 

export interface ChartMarketParams {
  symbols: string[];
  fromDate: string;
  toDate: string;
}