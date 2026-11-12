import type { LogLevel, Prisma } from "@prisma/client";
import { prisma } from "./db";

/** Writes an entry to the SystemLog table (visible to administrators). Never throws. */
export async function systemLog(
  level: LogLevel,
  source: string,
  message: string,
  meta?: Prisma.InputJsonValue,
  sessionId?: string,
) {
  try {
    await prisma.systemLog.create({ data: { level, source, message, meta, sessionId } });
  } catch (err) {
    console.error("[systemLog] failed to persist log", { level, source, message }, err);
  }
  if (level === "ERROR") console.error(`[${source}] ${message}`, meta ?? "");
}
