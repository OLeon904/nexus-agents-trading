/**
 * Strategy Engine - Evaluates rules-based conditions
 *
 * NO LLM discretion here. Strategies are deterministic rules
 * that can be backtested, optimized, and deployed.
 */

import type { StrategyConfig, Condition, SignalRule } from "./types";

export interface PriceBar {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface EvaluationContext {
  symbol: string;
  currentPrice: number;
  bars: PriceBar[];
  position?: number;
}

function evaluateCondition(
  condition: Condition,
  ctx: EvaluationContext
): boolean {
  const { bars, currentPrice } = ctx;
  if (bars.length === 0) return false;

  const latest = bars[bars.length - 1];
  const prev = bars.length > 1 ? bars[bars.length - 2] : latest;

  switch (condition.type) {
    case "price": {
      const threshold = condition.params.threshold as number;
      switch (condition.params.operator as string) {
        case "gt": return currentPrice > threshold;
        case "gte": return currentPrice >= threshold;
        case "lt": return currentPrice < threshold;
        case "lte": return currentPrice <= threshold;
        default: return false;
      }
    }
    case "indicator": {
      // SMA example
      const period = (condition.params.period as number) ?? 20;
      if (bars.length < period) return false;
      const slice = bars.slice(-period);
      const sma = slice.reduce((s, b) => s + b.close, 0) / period;
      switch (condition.params.indicator) {
        case "above_sma": return currentPrice > sma;
        case "below_sma": return currentPrice < sma;
        default: return false;
      }
    }
    case "volume": {
      const threshold = condition.params.threshold as number;
      return latest.volume >= threshold;
    }
    default:
      return false;
  }
}

export function evaluateSignal(
  config: StrategyConfig,
  ctx: EvaluationContext
): { action: "BUY" | "SELL" | "HOLD"; reason: string } {
  for (const rule of config.signals) {
    const results = rule.conditions.map((c) => evaluateCondition(c, ctx));
    const passed =
      rule.logic === "AND"
        ? results.every(Boolean)
        : results.some(Boolean);

    if (passed && rule.action !== "HOLD") {
      return {
        action: rule.action,
        reason: `Rule: ${rule.conditions.map((c) => c.type).join("+")}`,
      };
    }
  }
  return { action: "HOLD", reason: "No signal" };
}

export function createSampleStrategy(): StrategyConfig {
  return {
    universe: ["SPY"],
    signals: [
      {
        conditions: [
          {
            id: "sma20_above",
            type: "indicator",
            operator: "gt",
            params: { indicator: "above_sma", period: 20 },
          },
        ],
        logic: "AND",
        action: "BUY",
        sizePct: 5,
      },
      {
        conditions: [
          {
            id: "sma20_below",
            type: "indicator",
            operator: "lt",
            params: { indicator: "below_sma", period: 20 },
          },
        ],
        logic: "AND",
        action: "SELL",
      },
    ],
    maxPositions: 1,
    stopLossPct: 2,
    takeProfitPct: 4,
  };
}
