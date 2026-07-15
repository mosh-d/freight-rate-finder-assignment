// QuotesError — the error state. Plan notes (commit 12):
//   - Render the typed ApiError message when available (useQuotesQuery throws
//     the parsed apiErrorSchema body), generic copy otherwise.
//   - Retry button wired to the query's refetch().
//   - Reachable on demand: destination "jupiter" → 500.
// Style: badge-red tone per PLAN.md §UI style guide.
import type { ApiError } from "../types";

interface QuotesErrorProps {
  error: ApiError | Error;
  onRetry: () => void;
}

export default function QuotesError({ error, onRetry }: QuotesErrorProps) {
  const isApiError = "message" in error;
  const errorMessage = isApiError ? error.message : "An unexpected error occurred";

  return (
    <div className="text-center py-12">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
        <svg
          className="w-8 h-8 text-red-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-red-900 mb-2">
        Something went wrong
      </h3>
      <p className="text-red-700 max-w-sm mx-auto mb-6">{errorMessage}</p>
      <button
        onClick={onRetry}
        className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-medium text-sm"
      >
        <svg
          className="w-4 h-4 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
        Try again
      </button>
    </div>
  );
}
