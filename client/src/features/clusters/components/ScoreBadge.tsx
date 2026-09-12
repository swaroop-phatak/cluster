interface ScoreBadgeProps {
  score: number;
}

export function ScoreBadge({ score }: ScoreBadgeProps) {
  let className = "bg-gray-100 text-gray-700";

  if (score >= 80) {
    className = "bg-green-100 text-green-700";
  } else if (score >= 50) {
    className = "bg-amber-100 text-amber-700";
  }

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${className}`}
    >
      Score: {score}
    </span>
  );
}