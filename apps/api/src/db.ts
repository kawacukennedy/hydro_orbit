export async function getPrisma() {
  try {
    const { PrismaClient } = await import('@prisma/client');
    return new PrismaClient();
  } catch {
    return null as any;
  }
}
