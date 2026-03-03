/**
 * Nexus Agents Trading - Core Types
 *
 * Philosophy (from NexusTrade): AI engineers strategies, doesn't execute.
 * Each "agent" = a deployed rules-based strategy, not LLM discretion.
 */

// ═══════════════════════════════════════════════════════════════
// STRATEGY CONFIG
// ═══════════════════════════════════════════════════════════════

export type ConditionOperator =
  | "gt" | "gte" | "lt" | "lte" | "eq" | "between"
  | "above_sma" | "below_sma" | "crosses_above" | "crosses_below";

export interface Condition {
  id: string;
  type: "price" | "indicator" | "volume" | "fundamental";
  operator: ConditionOperator;
  params: Record<string, number | string>;
  lookback?: number; // days
}

export interface SignalRule {
  conditions: Condition[];
  logic: "AND" | "OR";
  action: "BUY" | "SELL" | "HOLD";
  sizePct?: number;
}

export interface StrategyConfig {
  universe: string[]; // ["SPY", "QQQ", ...] or "SP500"
  signals: SignalRule[];
  positionSizing?: "fixed" | "percent_volatility" | "kelly";
  maxPositions?: number;
  stopLossPct?: number;
  takeProfitPct?: number;
}

// ═══════════════════════════════════════════════════════════════
// BACKTEST METRICS
// ═══════════════════════════════════════════════════════════════

export interface BacktestMetrics {
  totalReturn: number;
  annualizedReturn: number;
  sharpeRatio: number;
  sortinoRatio: number;
  maxDrawdown: number;
  maxDrawdownPct: number;
  winRate: number;
  profitFactor: number;
  numTrades: number;
}

// ═══════════════════════════════════════════════════════════════
// AGENT SIGNAL
// ═══════════════════════════════════════════════════════════════

export interface AgentSignal {
  agentId: string;
  strategyId: string;
  symbol: string;
  side: "BUY" | "SELL";
  quantity: number;
  confidence: number;
  reason: string;
}
