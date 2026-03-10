export interface Tick {
  isin: string;
  name: string;
  xetra_mid: number;
  xetra_spr: number;
  lsx_spr: number;
  gettex_spr: number;
  trade_gate_spr: number;
}

export interface RiskAlert {
  level: string;
  message: string;
}

export interface Metrics {
  throughput: number;
  is_paused: boolean;
}