// QuoteList — renders the quotes as QuoteCards. Plan notes (commit 11):
//   - Sort: cheapest totalCents first (documented decision); stable tiebreak
//     by transitDays, then carrier name, so order is fully deterministic.
//   - Sort here (presentation concern), not in the API — the server returns
//     generation order.
import type { Quote } from "../types";
import QuoteCard from "./QuoteCard";

interface QuoteListProps {
  quotes: Quote[];
}

export default function QuoteList({ quotes }: QuoteListProps) {
  const sortedQuotes = [...quotes].sort((a, b) => {
    // Primary: cheapest totalCents first
    if (a.totalCents !== b.totalCents) {
      return a.totalCents - b.totalCents;
    }
    // Secondary: fewer transitDays first
    if (a.transitDays !== b.transitDays) {
      return a.transitDays - b.transitDays;
    }
    // Tertiary: carrier name alphabetically
    return a.carrier.localeCompare(b.carrier);
  });

  return (
    <div className="space-y-3">
      {sortedQuotes.map((quote) => (
        <QuoteCard key={quote.id} quote={quote} />
      ))}
    </div>
  );
}
