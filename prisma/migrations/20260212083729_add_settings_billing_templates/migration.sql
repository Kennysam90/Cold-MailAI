/*
  Warnings:

  - Added the required column `subject` to the `Template` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Billing" ADD COLUMN     "currentPeriodEnd" TIMESTAMP(3),
ADD COLUMN     "paystackCustomerCode" TEXT,
ADD COLUMN     "paystackSubscriptionCode" TEXT,
ADD COLUMN     "stripeCustomerId" TEXT,
ADD COLUMN     "stripeSubscriptionId" TEXT;

-- AlterTable
ALTER TABLE "Template" ADD COLUMN     "subject" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "WorkspaceSettings" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "ollamaBaseUrl" TEXT,
    "ollamaModel" TEXT,
    "ollamaApiKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkspaceSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WorkspaceSettings_workspaceId_key" ON "WorkspaceSettings"("workspaceId");

-- AddForeignKey
ALTER TABLE "WorkspaceSettings" ADD CONSTRAINT "WorkspaceSettings_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
