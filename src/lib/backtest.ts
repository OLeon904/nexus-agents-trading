/**
 * Backtest Pipeline - Validate strategies before deployment
 *
 * Per NexusTrade: "Don't trade based on vibes. Backtest first."
 * A strategy must pass the net-gains gate before an agent can deploy it.
 */

import type { StrategyConfig } from "./types";
import type { PriceBar } from "./strategy-engine";
import { evaluateSignal } from "./strategy-engine";

export interface BacktestResult {
  initialCapital: number;
  finalCapital: number;
  totalReturn: number;
  totalReturnPct: number;
  sharpeRatio: number;
  sortinoRatio: number;
  maxDrawdown: number;
  maxDrawdownPct: number;
  winRate: number;
  numTrades: number;
  trades: TradeRecord[];
  passed: boolean;
}

export interface TradeRecord {
  date: string;
  symbol: string;
  side: "BUY" | "SELL";
  quantity: number;
  price: number;
  pnl?: number;
}

const RISK_FREE_RATE = 0.05;
const MIN_SORTINO = 0.5;
const MAX_DRAWDOWN_PCT = 15;

export function runBacktest(
  config: StrategyConfig,
  data: Record<string, PriceBar[]>,
  initialCapital: number = 100_000,
  startDate?: string,
  endDate?: string
): BacktestResult {
  const symbols = config.universe;
  const trades: TradeRecord[] = [];
  let capital = initialCapital;
  const positions: Map<string, number> = new Map();
  let peak = capital;
  let maxDrawdown = 0;

  const allDates = new Set<string>();
  for (const sym of symbols) {
    const bars = data[sym] ?? [];
    bars.forEach((b) => allDates.add(b.date));
  }
  const sortedDates = [...allDates].sort();

  let filteredDates = sortedDates;
  if (startDate) filteredDates = filteredDates.filter((d) => d >= startDate);
  if (endDate) filteredDates = filteredDates.filter((d) => d <= endDate);

  for (const date of filteredDates) {
    for (const symbol of symbols) {
      const bars = data[symbol] ?? [];
      const idx = bars.findIndex((b) => b.date === date);
      const periods = config.signals.flatMap((s) =>
        s.conditions.map((c) => (c.params?.period as number) ?? 20)
      );
      const minBars = periods.length ? Math.max(...periods, 20) : 20;
      if (idx < minBars) continue;

      const ctx = {
        symbol: symbol,
        currentPrice: bars[idx].close,
        bars: bars.slice(0, idx + 1),
        position: positions.get(symbol),
      };

      const { action } = evaluateSignal(config, ctx);

      if (action === "BUY" && (positions.get(symbol) ?? 0) <= 0) {
        const sizePct = config.signals.find((s) => s.action === "BUY")?.sizePct ?? 5;
        const amount = capital * (sizePct / 100);
        const qty = Math.floor(amount / bars[idx].close);
        if (qty > 0 && amount <= capital) {
          capital -= qty * bars[idx].close;
          positions.set(symbol, (positions.get(symbol) ?? 0) + qty);
          trades.push({
            date,
            symbol,
            side: "BUY",
            quantity: qty,
            price: bars[idx].close,
          });
        }
      } else if (action === "SELL" && (positions.get(symbol) ?? 0) > 0) {
        const qty = positions.get(symbol)!;
        const proceeds = qty * bars[idx].close;
        capital += proceeds;
        positions.set(symbol, 0);
        trades.push({
          date,
          symbol,
          side: "SELL",
          quantity: qty,
          price: bars[idx].close,
        });
      }
    }

    // Mark-to-market
    let portValue = capital;
    for (const [sym, qty] of positions) {
      const bars = data[sym] ?? [];
      const bar = bars.find((b) => b.date === date);
      if (bar) portValue += qty * bar.close;
    }
    if (portValue > peak) peak = portValue;
    const dd = peak - portValue;
    if (dd > maxDrawdown) maxDrawdown = dd;
  }

  // Close remaining positions at last price
  for (const [symbol, qty] of positions) {
    const bars = data[symbol] ?? [];
    const last = bars[bars.length - 1];
    if (last && qty > 0) {
      capital += qty * last.close;
      trades.push({
        date: last.date,
        symbol,
        side: "SELL",
        quantity: qty,
        price: last.close,
      });
    }
  }

  const totalReturn = capital - initialCapital;
  const totalReturnPct = (totalReturn / initialCapital) * 100;
  const maxDrawdownPct = (maxDrawdown / peak) * 100;

  const wins = trades.filter((t) => t.side === "SELL" && (t.pnl ?? 0) > 0).length;
  const sells = trades.filter((t) => t.side === "SELL").length;
  const winRate = sells > 0 ? wins / sells : 0;

  const returns: number[] = [];
  for (let i = 1; i < trades.length; i++) {
    const prev = trades[i - 1];
    const curr = trades[i];
    if (curr.side === "SELL" && prev.side === "BUY") {
      const pnl = (curr.price - prev.price) * prev.quantity;
      returns.push(pnl / initialCapital);
    }
  }
  const avgReturn = returns.length ? returns.reduce((a, b) => a + b, 0) / returns.length : 0;
  const stdReturn = returns.length
    ? Math.sqrt(returns.reduce((s, r) => s + (r - avgReturn) ** 2, 0) / returns.length)
    : 0;
  const downsideReturns = returns.filter((r) => r < 0);
  const downsideStd =
    downsideReturns.length
      ? Math.sqrt(
          downsideReturns.reduce((s, r) => s + r ** 2, 0) / downsideReturns.length
        )
      : 0.001;

  const sharpeRatio = stdReturn > 0 ? (avgReturn - RISK_FREE_RATE / 252) / stdReturn : 0;
  const sortinoRatio = downsideStd > 0 ? avgReturn / downsideStd : 0;

  const passed =
    totalReturnPct > 0 &&
    sortinoRatio >= MIN_SORTINO &&
    maxDrawdownPct <= MAX_DRAWDOWN_PCT;

  return {
    initialCapital,
    finalCapital: capital,
    totalReturn,
    totalReturnPct,
    sharpeRatio,
    sortinoRatio,
    maxDrawdown,
    maxDrawdownPct,
    winRate,
    numTrades: trades.length,
    trades,
    passed,
  };
}
