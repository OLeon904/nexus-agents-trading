-- CreateEnum
CREATE TYPE "StrategyStatus" AS ENUM ('DRAFT', 'BACKTESTED', 'PAPER_ACTIVE', 'LIVE_ACTIVE', 'PAUSED', 'RETIRED');

-- CreateEnum
CREATE TYPE "AgentStatus" AS ENUM ('PAUSED', 'PAPER_ACTIVE', 'LIVE_ACTIVE');

-- CreateEnum
CREATE TYPE "ExecutionSide" AS ENUM ('BUY', 'SELL');

-- CreateEnum
CREATE TYPE "ExecutionMode" AS ENUM ('PAPER', 'LIVE');

-- CreateTable
CREATE TABLE "Strategy" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" "StrategyStatus" NOT NULL DEFAULT 'DRAFT',
    "config" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Strategy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Agent" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "strategyId" TEXT NOT NULL,
    "status" "AgentStatus" NOT NULL DEFAULT 'PAUSED',
    "capitalPct" DOUBLE PRECISION NOT NULL,
    "lastSignalAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Agent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentAllocation" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "strategyId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "allocatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AgentAllocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BacktestRun" (
    "id" TEXT NOT NULL,
    "strategyId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "initialCapital" DOUBLE PRECISION NOT NULL,
    "finalCapital" DOUBLE PRECISION NOT NULL,
    "metrics" JSONB NOT NULL,
    "passedGate" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BacktestRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Execution" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "strategyId" TEXT NOT NULL,
    "side" "ExecutionSide" NOT NULL,
    "symbol" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,
    "mode" "ExecutionMode" NOT NULL,
    "externalId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Execution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyPnL" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "totalPnL" DOUBLE PRECISION NOT NULL,
    "agentPnLs" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DailyPnL_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DailyPnL_date_key" ON "DailyPnL"("date");

-- AddForeignKey
ALTER TABLE "Agent" ADD CONSTRAINT "Agent_strategyId_fkey" FOREIGN KEY ("strategyId") REFERENCES "Strategy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentAllocation" ADD CONSTRAINT "AgentAllocation_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentAllocation" ADD CONSTRAINT "AgentAllocation_strategyId_fkey" FOREIGN KEY ("strategyId") REFERENCES "Strategy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BacktestRun" ADD CONSTRAINT "BacktestRun_strategyId_fkey" FOREIGN KEY ("strategyId") REFERENCES "Strategy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Execution" ADD CONSTRAINT "Execution_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Execution" ADD CONSTRAINT "Execution_strategyId_fkey" FOREIGN KEY ("strategyId") REFERENCES "Strategy"("id") ON DELETE CASCADE ON UPDATE CASCADE;
