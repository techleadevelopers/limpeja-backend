/*
  Backfill Address.location from latitude/longitude for legacy rows.

  Usage:
    - Ensure DATABASE_URL is set (or present in .env)
    - Run: npm run backfill:location
*/

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('[Backfill] Iniciando backfill de Address.location a partir de latitude/longitude...');

  // Atualiza somente onde location está nulo e latitude/longitude existem
  const updated = await prisma.$executeRawUnsafe(`
    UPDATE "Address"
    SET "location" = ST_SetSRID(ST_MakePoint("longitude"::double precision, "latitude"::double precision), 4326)
    WHERE "location" IS NULL
      AND "latitude" IS NOT NULL
      AND "longitude" IS NOT NULL
  `);

  console.log(`[Backfill] Concluído. Linhas atualizadas: ${updated}`);
}

main()
  .catch((err) => {
    console.error('[Backfill] Erro ao executar backfill:', err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

