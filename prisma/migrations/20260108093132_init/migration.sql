-- CreateTable
CREATE TABLE "StockSetup" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ticker" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'WAITING',
    "convictionScore" INTEGER NOT NULL DEFAULT 0,
    "analysisMarkdown" TEXT,
    "entryZone" TEXT,
    "stopLoss" REAL,
    "targetPrice" REAL,
    "lastReviewedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
