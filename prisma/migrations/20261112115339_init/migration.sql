-- CreateEnum
CREATE TYPE "Role" AS ENUM ('LECTURER', 'ADMIN');

-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('NEW', 'IN_REVIEW', 'CONTACTED', 'SCHEDULED', 'COMPLETED', 'CLOSED');

-- CreateEnum
CREATE TYPE "EmailStatus" AS ENUM ('PENDING', 'SENT', 'FAILED', 'NOT_CONFIGURED');

-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('SCHEDULED', 'LIVE', 'PAUSED', 'ENDED');

-- CreateEnum
CREATE TYPE "ProcessingMode" AS ENUM ('DEMO', 'LIVE');

-- CreateEnum
CREATE TYPE "TermStatus" AS ENUM ('SAMPLE', 'DRAFT', 'IN_REVIEW', 'REVIEWED');

-- CreateEnum
CREATE TYPE "LogLevel" AS ENUM ('INFO', 'WARN', 'ERROR');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'LECTURER',
    "department" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DemoRequest" (
    "id" TEXT NOT NULL,
    "idempotencyKey" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "organisation" TEXT NOT NULL,
    "jobTitle" TEXT,
    "country" TEXT,
    "organisationType" TEXT,
    "areaOfInterest" TEXT,
    "preferredDate" DATE,
    "preferredTime" TEXT,
    "expectedAttendees" INTEGER,
    "message" TEXT,
    "consent" BOOLEAN NOT NULL,
    "status" "RequestStatus" NOT NULL DEFAULT 'NEW',
    "adminNotes" TEXT,
    "notifyStatus" "EmailStatus" NOT NULL DEFAULT 'PENDING',
    "ackStatus" "EmailStatus" NOT NULL DEFAULT 'PENDING',
    "ipHash" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DemoRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactMessage" (
    "id" TEXT NOT NULL,
    "idempotencyKey" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" "RequestStatus" NOT NULL DEFAULT 'NEW',
    "notifyStatus" "EmailStatus" NOT NULL DEFAULT 'PENDING',
    "ipHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContactMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamMember" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "bio" TEXT,
    "photoUrl" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeamMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LectureSession" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "courseCode" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "introduction" TEXT,
    "summary" TEXT,
    "status" "SessionStatus" NOT NULL DEFAULT 'SCHEDULED',
    "mode" "ProcessingMode" NOT NULL DEFAULT 'DEMO',
    "micEnabled" BOOLEAN NOT NULL DEFAULT false,
    "studentMicEnabled" BOOLEAN NOT NULL DEFAULT true,
    "demoScriptId" TEXT,
    "demoCursor" INTEGER NOT NULL DEFAULT 0,
    "lecturerId" TEXT,
    "startedAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LectureSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Segment" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "seq" INTEGER NOT NULL,
    "english" TEXT NOT NULL,
    "kiswahili" TEXT,
    "termIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "source" "ProcessingMode" NOT NULL,
    "asrMs" INTEGER,
    "translateMs" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Segment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Participant" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "admissionNumber" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leftAt" TIMESTAMP(3),

    CONSTRAINT "Participant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Question" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "admissionNumber" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "answered" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Term" (
    "id" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "english" TEXT NOT NULL,
    "kiswahili" TEXT NOT NULL,
    "definitionEn" TEXT,
    "definitionSw" TEXT,
    "usageNote" TEXT,
    "status" "TermStatus" NOT NULL DEFAULT 'DRAFT',
    "reviewedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Term_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemLog" (
    "id" TEXT NOT NULL,
    "level" "LogLevel" NOT NULL DEFAULT 'INFO',
    "source" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "meta" JSONB,
    "sessionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SystemLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "DemoRequest_idempotencyKey_key" ON "DemoRequest"("idempotencyKey");

-- CreateIndex
CREATE INDEX "DemoRequest_email_createdAt_idx" ON "DemoRequest"("email", "createdAt");

-- CreateIndex
CREATE INDEX "DemoRequest_ipHash_createdAt_idx" ON "DemoRequest"("ipHash", "createdAt");

-- CreateIndex
CREATE INDEX "DemoRequest_status_idx" ON "DemoRequest"("status");

-- CreateIndex
CREATE UNIQUE INDEX "ContactMessage_idempotencyKey_key" ON "ContactMessage"("idempotencyKey");

-- CreateIndex
CREATE INDEX "ContactMessage_ipHash_createdAt_idx" ON "ContactMessage"("ipHash", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "LectureSession_code_key" ON "LectureSession"("code");

-- CreateIndex
CREATE INDEX "LectureSession_status_idx" ON "LectureSession"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Segment_sessionId_seq_key" ON "Segment"("sessionId", "seq");

-- CreateIndex
CREATE UNIQUE INDEX "Participant_sessionId_admissionNumber_key" ON "Participant"("sessionId", "admissionNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Term_subject_english_key" ON "Term"("subject", "english");

-- CreateIndex
CREATE INDEX "SystemLog_level_createdAt_idx" ON "SystemLog"("level", "createdAt");

-- CreateIndex
CREATE INDEX "SystemLog_source_createdAt_idx" ON "SystemLog"("source", "createdAt");

-- AddForeignKey
ALTER TABLE "LectureSession" ADD CONSTRAINT "LectureSession_lecturerId_fkey" FOREIGN KEY ("lecturerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Segment" ADD CONSTRAINT "Segment_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "LectureSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Participant" ADD CONSTRAINT "Participant_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "LectureSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "LectureSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
