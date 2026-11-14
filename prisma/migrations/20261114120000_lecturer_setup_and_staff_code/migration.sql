-- AlterTable
ALTER TABLE "User" ADD COLUMN     "setupTokenExpires" TIMESTAMP(3),
ADD COLUMN     "setupTokenHash" TEXT,
ADD COLUMN     "staffCode" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_setupTokenHash_key" ON "User"("setupTokenHash");

