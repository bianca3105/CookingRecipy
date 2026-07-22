import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { FOLDER_DEFS } from "../src/lib/folders";

const adapter = new PrismaLibSql({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  for (const [index, folder] of FOLDER_DEFS.entries()) {
    await prisma.folder.upsert({
      where: { key: folder.key },
      update: { name: folder.name, order: index },
      create: { key: folder.key, name: folder.name, order: index },
    });
  }
  console.log(`Seeded ${FOLDER_DEFS.length} folders.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
