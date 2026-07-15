// Providers — client component wrapping the app in QueryClientProvider.
// Plan notes (commit 9): create the QueryClient once (useState initializer, not
// module scope — avoids sharing state across requests in dev/SSR); defaults
// worth setting: refetchOnWindowFocus: false (data is deterministic), retry: 1.
// Mount inside layout.tsx around {children}.
"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
