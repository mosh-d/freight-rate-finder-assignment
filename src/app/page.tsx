import { Suspense } from "react";

import RatesPage from "@/modules/rates/components/RatesPage";

// Thin server shell: the static header renders on the server; RatesPage reads
// useSearchParams, which bails out of prerendering, so it hydrates inside
// Suspense on the client.
export default function Home() {
  return (
    <main className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto p-6">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-primary-dark mb-2">
            Freight Rate Finder
          </h1>
          <p className="text-primary-dark/50">
            Search for freight shipping rates and compare quotes.
          </p>
        </header>

        <Suspense>
          <RatesPage />
        </Suspense>
      </div>
    </main>
  );
}
