// QuotesEmpty — the zero-results state (reachable via destination "nowhere").
// Plan notes (commit 12): friendly copy suggesting a different route/date;
// distinct from the pre-search idle state (no search in the URL yet), which
// the page handles separately.
export default function QuotesEmpty() {
  return (
    <div className="text-center py-12">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-secondary-light/20 rounded-full mb-4">
        <svg
          className="w-8 h-8 text-secondary-light"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-primary-dark mb-2">
        No quotes found
      </h3>
      <p className="text-primary-dark/70 max-w-sm mx-auto">
        We could not find any quotes for this route. Try a different destination
        or ship date.
      </p>
    </div>
  );
}
