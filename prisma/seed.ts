import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.strategy.findFirst({ where: { name: "SMA Crossover Sample" } });
  if (existing) {
    console.log("Sample strategy already exists");
    return;
  }
  const strategy = await prisma.strategy.create({
    data: {
      name: "SMA Crossover Sample",
      description: "Buy when price above 20-day SMA",
      status: "DRAFT",
      config: {
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
        ],
      },
    },
  });
  console.log("Seeded strategy:", strategy.name);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
