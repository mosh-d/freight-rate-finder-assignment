// useSearchParamsState — the URL is the single source of truth for the
// current search. Plan notes (commits 9/13):
//   read:  useSearchParams() → paramsToSearch(...) → RateSearch | null
//   write: setSearch(search) → router.replace(`?${searchToParams(search)}`)
// replace (not push) keeps reload/back-button behavior sane; null = no search yet.
"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { paramsToSearch, searchToParams } from "../urlCodec";
import type { RateSearch } from "../types";

export function useSearchParamsState() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const search = paramsToSearch(searchParams);

  const setSearch = (newSearch: RateSearch | null) => {
    if (newSearch === null) {
      router.replace(window.location.pathname);
      return;
    }

    const params = searchToParams(newSearch);
    router.replace(`?${params.toString()}`);
  };

  return { search, setSearch };
}
