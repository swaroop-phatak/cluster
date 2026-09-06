import type { NextFunction, Request, Response } from "express";
import { getInsiderProfile } from "../../repositories/insider.repository";
import { NotFoundError } from "../../lib/errors";

export async function getProfile(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const insider = await getInsiderProfile(req.params.id as string);

    if (!insider) {
      throw new NotFoundError("Insider not found");
    }

    const transactionHistory = insider.filings.flatMap(
      (filing) => filing.transactions,
    );

    return res.status(200).json({
      insider: {
        id: insider.id,
        cik: insider.cik,
        name: insider.name,
        createdAt: insider.createdAt,
      },
      roles: insider.roles,
      transactionHistory,
    });
  } catch (error) {
    next(error);
  }
}