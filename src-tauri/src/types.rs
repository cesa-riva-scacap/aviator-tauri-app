use serde::{Deserialize, Serialize};

// 1. The Standard Price Update
#[derive(Deserialize, Serialize, Clone, Debug)]
pub struct Tick {
    pub isin: String,
    pub name: String,
    pub xetra_mid: f64,
    pub xetra_spr: f64,
    pub lsx_spr: f64,
    pub gettex_spr: f64,
    pub trade_gate_spr: f64, // Matched the backend naming!
}

// 2. The High-Priority Risk Alert
#[derive(Deserialize, Serialize, Clone, Debug)]
pub struct RiskAlert {
    pub level: String,
    pub message: String,
}

// 3. The Multiplexed Message Enum
#[derive(Deserialize, Serialize, Debug)]
#[serde(tag = "type", content = "payload")]
pub enum WsMessage {
    Batch(Vec<Tick>),
    Risk(RiskAlert),
}

// 4. Our internal Frontend Telemetry
#[derive(Serialize, Clone, Debug)]
pub struct Metrics {
    pub throughput: u32,
    pub is_paused: bool,
}