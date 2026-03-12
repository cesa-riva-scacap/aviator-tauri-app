export interface Tick {
  isin: string;
  name: string;
  xetra_mid: number;
  xetra_spr: number;
  lsx_spr: number;
  gettex_spr: number;
  trade_gate_spr: number;
  bid_size: number;
  ask_size: number;
  vol_xetra: number;
  vol_lsx: number;
  vol_gettex: number;
  vwap: number;
  day_high: number;
  day_low: number;
  ytd_perf: number;
  moving_avg: number;
  rsi: number;
  macd: number;
  bollinger: number;
}

export interface RiskAlert {
  level: string;
  message: string;
}

export interface Metrics {
  throughput: number;
  is_paused: boolean;
}