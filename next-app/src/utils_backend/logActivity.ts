import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function logActivity(
  userId: string,
  entityType: string,
  entityId: string,
  action: string,
  metadata?: Record<string, any>
) {
  try {
    await prisma.activityLog.create({
      data: {
        userId,
        entityType,
        entityId,
        action,
        metadata: metadata || undefined
      }
    });
  } catch (err) {
    // Never crash a route because of a failed log
    console.error('[logActivity] Failed to write activity log:', err);
  }
}
