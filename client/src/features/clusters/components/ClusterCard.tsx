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
      <article className="rounded-xl border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">
              {cluster.company.name}
            </h2>

            {cluster.company.ticker && (
              <p className="text-sm text-gray-500">
                {cluster.company.ticker}
              </p>
            )}
          </div>

          <ScoreBadge score={cluster.score} />
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
          <span className="rounded-full bg-gray-100 px-3 py-1 text-gray-700">
            {cluster.insiderCount}{" "}
            {cluster.insiderCount === 1 ? "insider" : "insiders"}
          </span>

          <span className="text-gray-500">
            {new Date(cluster.windowStart).toLocaleDateString()} –{" "}
            {new Date(cluster.windowEnd).toLocaleDateString()}
          </span>
        </div>
      </article>
    </Link>
  );
}