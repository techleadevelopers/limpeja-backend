/*
  Warnings:

  - The primary key for the `UserConsent` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The required column `id` was added to the `UserConsent` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- DropForeignKey
ALTER TABLE "MessagePolicyHit" DROP CONSTRAINT "MessagePolicyHit_bookingId_fkey";

-- DropForeignKey
ALTER TABLE "MessagePolicyHit" DROP CONSTRAINT "MessagePolicyHit_chatId_fkey";

-- DropForeignKey
ALTER TABLE "MessagePolicyHit" DROP CONSTRAINT "MessagePolicyHit_disputeId_fkey";

-- DropForeignKey
ALTER TABLE "MessagePolicyHit" DROP CONSTRAINT "MessagePolicyHit_userId_fkey";

-- AlterTable
ALTER TABLE "ProviderService" ALTER COLUMN "pricePerHour" DROP DEFAULT;

-- AlterTable
ALTER TABLE "UserConsent" DROP CONSTRAINT "UserConsent_pkey",
ADD COLUMN     "documentHash" TEXT,
ADD COLUMN     "id" TEXT NOT NULL,
ADD COLUMN     "ipAddress" TEXT,
ADD COLUMN     "source" TEXT,
ADD COLUMN     "userAgent" TEXT,
ADD CONSTRAINT "UserConsent_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE INDEX "UserConsent_userId_documentType_consentedAt_idx" ON "UserConsent"("userId", "documentType", "consentedAt");

-- AddForeignKey
ALTER TABLE "MessagePolicyHit" ADD CONSTRAINT "MessagePolicyHit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessagePolicyHit" ADD CONSTRAINT "MessagePolicyHit_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessagePolicyHit" ADD CONSTRAINT "MessagePolicyHit_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessagePolicyHit" ADD CONSTRAINT "MessagePolicyHit_disputeId_fkey" FOREIGN KEY ("disputeId") REFERENCES "Dispute"("id") ON DELETE SET NULL ON UPDATE CASCADE;
