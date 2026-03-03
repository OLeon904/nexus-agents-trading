/**
 * Market Data Fetcher - Free APIs for backtesting
 *
 * Finnhub: 60 calls/min free - https://finnhub.io/register
 * Returns OHLC candles for backtesting
 */

import type { PriceBar } from "./strategy-engine";

const FINNHUB_BASE = "https://finnhub.io/api/v1";

export async function fetchFinnhubCandles(
  symbol: string,
  from: Date,
  to: Date,
  apiKey: string,
  resolution: "D" | "W" | "1" | "5" | "15" | "30" | "60" = "D"
): Promise<PriceBar[]> {
  const fromUnix = Math.floor(from.getTime() / 1000);
  const toUnix = Math.floor(to.getTime() / 1000);

  const url = `${FINNHUB_BASE}/stock/candle?symbol=${encodeURIComponent(symbol)}&resolution=${resolution}&from=${fromUnix}&to=${toUnix}&token=${apiKey}`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Finnhub API error ${res.status}: ${await res.text()}`);
  }

  const json = (await res.json()) as {
    o?: number[];
    h?: number[];
    l?: number[];
    c?: number[];
    v?: number[];
    t?: number[];
    s?: string;
  };

  if (json.s === "no_data" || !json.t?.length) {
    return [];
  }

  const bars: PriceBar[] = [];
  for (let i = 0; i < (json.t?.length ?? 0); i++) {
    bars.push({
      date: new Date((json.t![i] ?? 0) * 1000).toISOString().slice(0, 10),
      open: json.o?.[i] ?? 0,
      high: json.h?.[i] ?? 0,
      low: json.l?.[i] ?? 0,
      close: json.c?.[i] ?? 0,
      volume: json.v?.[i] ?? 0,
    });
  }
  return bars;
}

/**
 * Fetch up to 1 year of daily data (Finnhub limit per request)
 * For longer ranges, make multiple requests.
 */
export async function fetchHistoricalBars(
  symbols: string[],
  daysBack: number,
  apiKey: string
): Promise<Record<string, PriceBar[]>> {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - daysBack);

  const result: Record<string, PriceBar[]> = {};
  for (const symbol of symbols) {
    const bars = await fetchFinnhubCandles(symbol, from, to, apiKey, "D");
    result[symbol] = bars;
    await new Promise((r) => setTimeout(r, 1100)); // ~60/min = 1 per second to stay safe
  }
  return result;
}
