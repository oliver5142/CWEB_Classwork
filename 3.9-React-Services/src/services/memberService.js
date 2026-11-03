// src/services/memberService.js - service modules usually in camel case

import { useQuery } from "@tanstack/react-query";

// This function only makes the HTTP request and returns its data. 
// Keeping it separate from the hook makes the API details easier to find and reuse.
async function searchMembers(search, { signal }) {
  const searchParams = new URLSearchParams({ search });
  // TanStack Query uses signal to cancel an older request when the search text changes.
  const response = await fetch(`/api/members?${searchParams}`, { signal });

  // fetch only rejects for network errors, so check HTTP status ourselves.
  if (!response.ok) {
    throw new Error("Unable to search members.");
  }

  const members = await response.json();
  if (!Array.isArray(members)) {
    throw new Error("The member search returned an invalid response.");
  }

  return members;
}

// This is a custom React hook: starts with "use"
// Call it at the top level of a component (or another hook), 
// DO NOT call in a condition or event handler. 
export function useMembers(search) {
  const cleanedSearch = search.trim();

  // A query is for reading data from the api server. 
  // TanStack Query runs this function:
  // when enabled, caches the result, and exposes data/loading/error state. 
  // The key identifies which search the cache is for.
  return useQuery({
    queryKey: ["members", cleanedSearch],
    queryFn: ({ signal }) => searchMembers(cleanedSearch, { signal }),
    // Do not send a request for an empty search. Empty string is falsey
    enabled: Boolean(cleanedSearch),
    // Cached results are considered fresh for five minutes. 
    // Reusing fresh data avoids a redundant request if the user repeats the same search.
    staleTime: 1000 * 60 * 5
  });
}