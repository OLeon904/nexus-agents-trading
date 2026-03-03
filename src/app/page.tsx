"use client";

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold tracking-tight mb-2">
          Nexus Agents Trading
        </h1>
        <p className="text-zinc-400 mb-8">
          Multi-agent day trading platform. AI engineers strategies; rules execute.
        </p>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card
            title="Strategy Engine"
            desc="Rules-based conditions. No LLM discretion. Backtestable."
          />
          <Card
            title="Agent Orchestrator"
            desc="Multiple agents, capital allocation, risk limits."
          />
          <Card
            title="Net Gains Gate"
            desc="Strategies must pass backtest before deployment."
          />
        </div>

        <div className="mt-12 p-6 rounded-xl bg-zinc-900 border border-zinc-800">
          <h2 className="text-lg font-semibold mb-2">Philosophy</h2>
          <p className="text-zinc-400 text-sm leading-relaxed">
            Based on{" "}
            <a
              href="https://nexustrade.io/blog/too-many-idiots-are-using-openclaw-to-trade-heres-how-to-trade-with-AI-the-right-way-20260203"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-400 hover:underline"
            >
              NexusTrade&apos;s approach
            </a>
            : Don&apos;t use LLMs as discretionary traders. Use AI to{" "}
            <em>engineer</em> trading strategies—create hypotheses, backtest,
            optimize, deploy. Each agent runs a rules-based strategy that passed
            the net-gains gate. Combined with{" "}
            <a
              href="https://github.com/Temple-Stuart/temple-stuart-accounting"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-400 hover:underline"
            >
              Temple-Stuart
            </a>{" "}
            -style ledger for full audit trail.
          </p>
        </div>

        <div className="mt-8 text-sm text-zinc-500">
          Run <code className="bg-zinc-800 px-2 py-0.5 rounded">npm run backtest</code> to
          validate the sample strategy.
        </div>
      </div>
    </main>
  );
}

function Card({
  title,
  desc,
}: {
  title: string;
  desc: string;
}) {
  return (
    <div className="p-4 rounded-lg bg-zinc-900/80 border border-zinc-800">
      <h3 className="font-medium mb-1">{title}</h3>
      <p className="text-zinc-400 text-sm">{desc}</p>
    </div>
  );
}
