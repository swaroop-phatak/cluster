interface ScoreBadgeProps {
  score: number;
}

export function ScoreBadge({ score }: ScoreBadgeProps) {
  let className = "border-black bg-white text-black";

  if (score >= 80) {
    className = "border-green-600 bg-green-100 text-green-800";
  } else if (score >= 50) {
    className = "border-amber-600 bg-amber-100 text-amber-800";
  }

  return (
    <span
      className={`inline-flex shrink-0 items-center whitespace-nowrap border-2 px-3 py-1 text-sm font-black uppercase tracking-wide ${className}`}
    >
      Score: {score}
    </span>
  );
}