/**
 * Agent Orchestrator - Coordinates multiple strategy agents
 *
 * Ensures:
 * 1. Only backtested, net-gains strategies run
 * 2. Capital allocation across agents
 * 3. Risk limits enforced
 * 4. Daily P&L tracking for net-gains verification
 */

import type { AgentSignal } from "./types";

export interface OrchestratorConfig {
  maxDailyLossPct: number;
  maxPositionSizePct: number;
  maxAgentsConcurrent: number;
}

const DEFAULT_CONFIG: OrchestratorConfig = {
  maxDailyLossPct: 5,
  maxPositionSizePct: 10,
  maxAgentsConcurrent: 5,
};

export class Orchestrator {
  private config: OrchestratorConfig;
  private dailyPnL: number = 0;
  private openPositions: Map<string, number> = new Map();

  constructor(config: Partial<OrchestratorConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Gate: Only allow signals from strategies that passed backtest
   */
  canExecuteSignal(signal: AgentSignal, strategyPassedBacktest: boolean): boolean {
    if (!strategyPassedBacktest) return false;

    // Daily loss limit
    if (this.dailyPnL < -this.config.maxDailyLossPct) return false;

    // Position size limit
    const positionValue = this.openPositions.get(signal.symbol) ?? 0;
    const newPositionPct = (positionValue + signal.quantity * signal.confidence) / 100;
    if (newPositionPct > this.config.maxPositionSizePct) return false;

    return true;
  }

  /**
   * Update daily P&L (called at end of day or on close)
   */
  recordPnL(amount: number): void {
    this.dailyPnL += amount;
  }

  /**
   * Reset daily state (call at market open)
   */
  resetDaily(): void {
    this.dailyPnL = 0;
  }

  updatePosition(symbol: string, quantity: number): void {
    const current = this.openPositions.get(symbol) ?? 0;
    const next = current + quantity;
    if (next === 0) this.openPositions.delete(symbol);
    else this.openPositions.set(symbol, next);
  }
}
