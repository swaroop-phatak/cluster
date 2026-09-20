import { Link } from "react-router-dom";
import { ScoreBadge } from "./ScoreBadge";

interface ClusterCardProps {
  cluster: {
    id: string;
    score: number;
    insiderCount: number;
    windowStart: string;
    windowEnd: string;
    company: {
      id: string;
      name: string;
      ticker?: string | null;
    };
  };
}

export function ClusterCard({ cluster }: ClusterCardProps) {
  return (
    <Link to={`/clusters/${cluster.id}`} className="block">
      <article className="border-2 border-black bg-white p-5 transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_#000]">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-lg font-black uppercase tracking-tight">
              {cluster.company.name}
            </h2>

            {cluster.company.ticker && (
              <p className="mt-1 text-xs font-bold uppercase tracking-wide text-neutral-500">
                {cluster.company.ticker}
              </p>
            )}
          </div>

          <div className="shrink-0">
            <ScoreBadge score={cluster.score} />
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3 text-sm">
          <span className="border-2 border-black px-3 py-1 text-xs font-bold uppercase tracking-wide">
            {cluster.insiderCount}{" "}
            {cluster.insiderCount === 1 ? "insider" : "insiders"}
          </span>

          <span className="font-medium text-neutral-500">
            {new Date(cluster.windowStart).toLocaleDateString()} –{" "}
            {new Date(cluster.windowEnd).toLocaleDateString()}
          </span>
        </div>
      </article>
    </Link>
  );
}