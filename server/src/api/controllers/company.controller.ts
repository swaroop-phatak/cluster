  import type { NextFunction, Request, Response } from "express";
  import {
    searchCompanies,
    getCompanyDashboard,
  } from "../../repositories/company.repository";
  import { NotFoundError } from "../../lib/errors";

  export async function search(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const q = req.query.q as string | undefined;
      const limit = Number(req.query.limit ?? 20);

      const companies = await searchCompanies(q ?? "", limit);

      return res.status(200).json({
        data: companies,
      });
    } catch (error) {
      next(error);
    }
  }


  export async function getDashboard(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const company = await getCompanyDashboard(req.params.id as string);

      if (!company) {
        throw new NotFoundError("Company not found");
      }

      const currentInsiders = [
        ...new Map(
          company.filings.map((filing) => [
            filing.insider.id,
            filing.insider,
          ]),
        ).values(),
      ];

      const recentTransactions = company.filings.flatMap(
        (filing) => filing.transactions,
      );

      return res.status(200).json({
        company,
        currentInsiders,
        recentTransactions,
        clusterHistory: company.clusters,
      });
    } catch (error) {
      next(error);
    }
  }