import { prisma } from "../db/client";

async function main() {
  await prisma.transaction.deleteMany({
    where: {
      filing: {
        accessionNumber: "000110465926081597",
      },
    },
  });

  await prisma.filing.delete({
    where: {
      accessionNumber: "000110465926081597",
    },
  });

  console.log("✅ Test filing deleted");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());