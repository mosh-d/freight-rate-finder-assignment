// RatesPage — the feature's page-level client component: URL-driven search
// state in, query out, all four result states rendered. app/page.tsx owns the
// static shell and wraps this in <Suspense>, required by useSearchParams
// during prerendering.
"use client";

import SearchForm from "./SearchForm";
import QuoteList from "./QuoteList";
import QuotesEmpty from "./QuotesEmpty";
import QuotesError from "./QuotesError";
import QuotesLoading from "./QuotesLoading";
import { useSearchParamsState } from "../hooks/useSearchParamsState";
import { useQuotesQuery } from "../hooks/useQuotesQuery";
import type { RateSearch } from "../types";

export default function RatesPage() {
  const { search, setSearch } = useSearchParamsState();
  const { data, isLoading, error, refetch } = useQuotesQuery(search);

  const handleSearchSubmit = (data: RateSearch) => {
    setSearch(data);
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-primary-light/10 border border-primary-light rounded-lg p-6">
            <h2 className="text-lg font-semibold text-primary-dark mb-4">
              Search Parameters
            </h2>
            <SearchForm defaultValues={search || undefined} onSubmit={handleSearchSubmit} />
          </div>

          <div className="bg-primary-light/10 border border-primary-light rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-primary-dark mb-4">
              Quotes
            </h2>
            {isLoading && <QuotesLoading />}
            {error && (
              <QuotesError error={error} onRetry={() => refetch()} />
            )}
            {data && data.quotes.length === 0 && <QuotesEmpty />}
            {data && data.quotes.length > 0 && <QuoteList quotes={data.quotes} />}
            {!search && !isLoading && (
              <div className="text-center py-12 text-primary-dark/50">
                <p>Enter search parameters to see quotes</p>
              </div>
            )}
      </div>
    </div>
  );
}
