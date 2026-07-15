// QuotesLoading — skeleton placeholders shown while the query is in flight
// (the seeded 400–900 ms latency guarantees this state is visible). Plan notes
// (commit 12): 3 skeleton cards matching QuoteCard's silhouette; animate-pulse
// is enough.
export default function QuotesLoading() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="bg-secondary-light/10 border border-secondary-light rounded-lg p-4 animate-pulse"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="h-4 bg-secondary-light/40 rounded w-24 mb-2" />
              <div className="h-3 bg-secondary-light/40 rounded w-16" />
            </div>
            <div className="text-right">
              <div className="h-6 bg-secondary-light/40 rounded w-20 mb-1" />
              <div className="h-3 bg-secondary-light/40 rounded w-16" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
