import { prisma } from "../db/client";
import type { InsiderRole} from "../generated/prisma/client";

interface InsiderRoleInput {
  insiderId: string;
  companyId: string;
  title: string | null;
  isOfficer: boolean;
  isDirector: boolean;
  isTenPercentOwner: boolean;
}

export async function upsertInsiderRole(role: InsiderRoleInput): Promise<InsiderRole> {
  return prisma.insiderRole.upsert({
    where: {
      insiderId_companyId: { insiderId: role.insiderId, companyId: role.companyId },
    },
    update: {
      title: role.title,
      isOfficer: role.isOfficer,
      isDirector: role.isDirector,
      isTenPercentOwner: role.isTenPercentOwner,
    },
    create: role,
  });
}