-- AlterTable
ALTER TABLE "Term" ADD COLUMN     "topic" TEXT;

-- CreateIndex
CREATE INDEX "Term_subject_topic_idx" ON "Term"("subject", "topic");
