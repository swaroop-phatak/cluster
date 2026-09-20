interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  page,
  totalPages,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const isFirstPage = page === 1;
  const isLastPage = page === totalPages;

  return (
    <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
      <button
        type="button"
        disabled={isFirstPage}
        onClick={() => onPageChange(page - 1)}
        className="border-2 border-black bg-white px-4 py-2 text-xs font-bold uppercase tracking-wide transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[3px_3px_0_#000] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-none"
      >
        Previous
      </button>

      <span className="border-2 border-black bg-black px-4 py-2 text-xs font-bold uppercase tracking-wide text-white">
        Page {page} of {totalPages}
      </span>

      <button
        type="button"
        disabled={isLastPage}
        onClick={() => onPageChange(page + 1)}
        className="border-2 border-black bg-white px-4 py-2 text-xs font-bold uppercase tracking-wide transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[3px_3px_0_#000] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-none"
      >
        Next
      </button>
    </div>
  );
}