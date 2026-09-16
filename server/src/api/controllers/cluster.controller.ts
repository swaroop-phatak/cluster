import type { NextFunction, Request, Response } from "express";
import { getCachedClusterFeed } from "../../services/cluster.service";
import { getClusterDetail } from "../../repositories/cluster.repository";
import { NotFoundError } from "../../lib/errors";
import type { ClusterFilters } from "../../types/cluster";

export async function getFeed(req: Request, res: Response, next: NextFunction) {
  try {
    const filters: ClusterFilters = {
      page: Number(req.query.page ?? 1),
      pageSize: Number(req.query.pageSize ?? 20),
      sortBy: (req.query.sortBy as "score" | "date") ?? "score",
      ...(req.query.minScore !== undefined && {
        minScore: Number(req.query.minScore),
      }),
      ...(req.query.sector !== undefined && {
        sector: req.query.sector as string,
      }),
      ...(req.query.dateFrom !== undefined && {
        dateFrom: new Date(req.query.dateFrom as string),
      }),
      ...(req.query.dateTo !== undefined && {
        dateTo: new Date(req.query.dateTo as string),
      }),
    };

    const result = await getCachedClusterFeed(filters);

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function getDetail(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const cluster = await getClusterDetail(req.params.id as string);

    if (!cluster) {
      throw new NotFoundError("Cluster not found");
    }

    return res.status(200).json({
      cluster,
      transactions: cluster.clusterTransactions.map(
        (item) => item.transaction,
      ),
      scoreBreakdown: cluster.scoreBreakdown,
    });
  } catch (error) {
    next(error);
  }
}
