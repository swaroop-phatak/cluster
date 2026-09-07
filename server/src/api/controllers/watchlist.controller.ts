import type { NextFunction, Request, Response } from "express";
import {
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist,
} from "../../repositories/watchlist.repository";

export async function getWatchlistController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.user!.id;

    const watchlist = await getWatchlist(userId);

    return res.status(200).json({
      data: watchlist,
    });
  } catch (error) {
    next(error);
  }
}

export async function addToWatchlistController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.user!.id;
    const { companyId } = req.body;

    const watchlist = await addToWatchlist(userId, companyId);

    return res.status(201).json({
      id: watchlist.id,
      companyId: watchlist.companyId,
    });
  } catch (error) {
    next(error);
  }
}

export async function removeFromWatchlistController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.user!.id;
    const { companyId } = req.params;

    await removeFromWatchlist(userId, companyId as string);

    return res.status(204).send();
  } catch (error) {
    next(error);
  }
}