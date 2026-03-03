/**
 * Market Data Fetcher - Multiple free/paid APIs for backtesting
 *
 * Polygon: polygon.io - 5 calls/min free
 * Alpaca: alpaca.markets - free with paper account
 * Twelve Data: twelvedata.com - free tier
 * Alpha Vantage: alphavantage.co - 25 calls/day free
 * Finnhub: finnhub.io - candle endpoint may require paid
 */

import type { PriceBar } from "./strategy-engine";

const FINNHUB_BASE = "https://finnhub.io/api/v1";

// ─────────────────────────────────────────────────────────────────────────────
// Finnhub
// ─────────────────────────────────────────────────────────────────────────────

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
  const res = await fetch(url, { headers: { "X-Finnhub-Token": apiKey } });
  if (!res.ok) throw new Error(`Finnhub API error ${res.status}: ${await res.text()}`);
  const json = (await res.json()) as { o?: number[]; h?: number[]; l?: number[]; c?: number[]; v?: number[]; t?: number[]; s?: string };
  if (json.s === "no_data" || !json.t?.length) return [];
  return (json.t ?? []).map((t, i) => ({
    date: new Date((t ?? 0) * 1000).toISOString().slice(0, 10),
    open: json.o?.[i] ?? 0,
    high: json.h?.[i] ?? 0,
    low: json.l?.[i] ?? 0,
    close: json.c?.[i] ?? 0,
    volume: json.v?.[i] ?? 0,
  }));
}

// ─────────────────────────────────────────────────────────────────────────────
// Alpha Vantage
// ─────────────────────────────────────────────────────────────────────────────

export async function fetchAlphaVantageCandles(symbol: string, apiKey: string): Promise<PriceBar[]> {
  const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${encodeURIComponent(symbol)}&outputsize=compact&apikey=${apiKey}`;
  const res = await fetch(url);
  const json = (await res.json()) as
    | { "Time Series (Daily)"?: Record<string, { "1. open": string; "2. high": string; "3. low": string; "4. close": string; "5. volume": string }> }
    | { "Error Message"?: string; "Note"?: string };
  if ("Error Message" in json) throw new Error(json["Error Message"] ?? "Alpha Vantage error");
  if ("Note" in json) throw new Error(json.Note ?? "Rate limit");
  const series = (json as { "Time Series (Daily)"?: Record<string, { "1. open": string; "2. high": string; "3. low": string; "4. close": string; "5. volume": string }> })["Time Series (Daily)"];
  if (!series) return [];
  return Object.entries(series)
    .map(([date, o]) => ({ date, open: parseFloat(o["1. open"]), high: parseFloat(o["2. high"]), low: parseFloat(o["3. low"]), close: parseFloat(o["4. close"]), volume: parseFloat(o["5. volume"]) }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

// ─────────────────────────────────────────────────────────────────────────────
// Polygon.io
// ─────────────────────────────────────────────────────────────────────────────

export async function fetchPolygonCandles(symbol: string, from: Date, to: Date, apiKey: string): Promise<PriceBar[]> {
  const fromStr = from.toISOString().slice(0, 10);
  const toStr = to.toISOString().slice(0, 10);
  const url = `https://api.polygon.io/v2/aggs/ticker/${encodeURIComponent(symbol)}/range/1/day/${fromStr}/${toStr}?apiKey=${apiKey}&sort=asc`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Polygon API error ${res.status}: ${await res.text()}`);
  const json = (await res.json()) as { results?: Array<{ t: number; o: number; h: number; l: number; c: number; v: number }> };
  if (!json.results?.length) return [];
  return json.results.map((r) => ({
    date: new Date(r.t).toISOString().slice(0, 10),
    open: r.o,
    high: r.h,
    low: r.l,
    close: r.c,
    volume: r.v,
  }));
}

// ─────────────────────────────────────────────────────────────────────────────
// Alpaca
// ─────────────────────────────────────────────────────────────────────────────

export async function fetchAlpacaCandles(
  symbol: string,
  from: Date,
  to: Date,
  apiKeyId: string,
  apiSecret: string,
  paper = true
): Promise<PriceBar[]> {
  const base = paper ? "https://data.sandbox.alpaca.markets" : "https://data.alpaca.markets";
  const fromStr = from.toISOString().slice(0, 10);
  const toStr = to.toISOString().slice(0, 10);
  const url = `${base}/v2/stocks/${encodeURIComponent(symbol)}/bars?timeframe=1Day&start=${fromStr}&end=${toStr}&limit=1000`;
  const res = await fetch(url, {
    headers: {
      "APCA-API-KEY-ID": apiKeyId,
      "APCA-API-SECRET-KEY": apiSecret,
    },
  });
  if (!res.ok) throw new Error(`Alpaca API error ${res.status}: ${await res.text()}`);
  const json = (await res.json()) as { bars?: Array<{ t: string; o: number; h: number; l: number; c: number; v: number }> };
  if (!json.bars?.length) return [];
  return json.bars.map((b) => ({
    date: b.t.slice(0, 10),
    open: b.o,
    high: b.h,
    low: b.l,
    close: b.c,
    volume: b.v,
  }));
}

// ─────────────────────────────────────────────────────────────────────────────
// Twelve Data
// ─────────────────────────────────────────────────────────────────────────────

export async function fetchTwelveDataCandles(symbol: string, apiKey: string, outputsize = 500): Promise<PriceBar[]> {
  const url = `https://api.twelvedata.com/time_series?symbol=${encodeURIComponent(symbol)}&interval=1day&outputsize=${outputsize}&apikey=${apiKey}`;
  const res = await fetch(url);
  const json = (await res.json()) as
    | { values?: Array<{ datetime: string; open: string; high: string; low: string; close: string; volume: string }> }
    | { code?: number; message?: string };
  if ("message" in json && json.code !== undefined) throw new Error(json.message ?? "Twelve Data error");
  const values = (json as { values?: Array<{ datetime: string; open: string; high: string; low: string; close: string; volume: string }> }).values;
  if (!values?.length) return [];
  return values
    .map((v) => ({ date: v.datetime.slice(0, 10), open: parseFloat(v.open), high: parseFloat(v.high), low: parseFloat(v.low), close: parseFloat(v.close), volume: parseFloat(v.volume) }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

// ─────────────────────────────────────────────────────────────────────────────
// Unified fetcher – tries all available sources in order
// ─────────────────────────────────────────────────────────────────────────────

export interface MarketDataKeys {
  polygonKey?: string;
  alpacaKeyId?: string;
  alpacaSecret?: string;
  alpacaPaper?: boolean;
  twelveDataKey?: string;
  alphaVantageKey?: string;
  finnhubKey?: string;
}

export async function fetchHistoricalBars(
  symbols: string[],
  daysBack: number,
  keys: MarketDataKeys
): Promise<Record<string, PriceBar[]>> {
  const result: Record<string, PriceBar[]> = {};
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - daysBack);
  const cutoff = from.toISOString().slice(0, 10);

  const sources: Array<{ name: string; fetch: () => Promise<PriceBar[]>; delay: number }> = [];

  for (const symbol of symbols) {
    sources.length = 0;

    if (keys.polygonKey) {
      sources.push({
        name: "Polygon",
        fetch: () => fetchPolygonCandles(symbol, from, to, keys.polygonKey!),
        delay: 13000, // 5/min
      });
    }
    if (keys.alpacaKeyId && keys.alpacaSecret) {
      sources.push({
        name: "Alpaca",
        fetch: () => fetchAlpacaCandles(symbol, from, to, keys.alpacaKeyId!, keys.alpacaSecret!, keys.alpacaPaper ?? true),
        delay: 300,
      });
    }
    if (keys.twelveDataKey) {
      sources.push({
        name: "Twelve Data",
        fetch: () => fetchTwelveDataCandles(symbol, keys.twelveDataKey!),
        delay: 9000, // free: ~8/min
      });
    }
    if (keys.alphaVantageKey) {
      sources.push({
        name: "Alpha Vantage",
        fetch: () => fetchAlphaVantageCandles(symbol, keys.alphaVantageKey!),
        delay: 13000,
      });
    }
    if (keys.finnhubKey) {
      sources.push({
        name: "Finnhub",
        fetch: () => fetchFinnhubCandles(symbol, from, to, keys.finnhubKey!, "D"),
        delay: 1100,
      });
    }

    let bars: PriceBar[] = [];
    for (const src of sources) {
      try {
        bars = await src.fetch();
        if (src.name === "Alpha Vantage" || src.name === "Twelve Data") {
          bars = bars.filter((b) => b.date >= cutoff);
        }
        if (bars.length > 0) {
          await new Promise((r) => setTimeout(r, src.delay));
          break;
        }
      } catch {
        // try next source
      }
    }
    result[symbol] = bars;
  }
  return result;
}
