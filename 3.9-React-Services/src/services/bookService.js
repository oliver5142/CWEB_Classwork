// src/services/bookService.js - service modules usually in camel case

import { useQuery } from "@tanstack/react-query";

// This function only makes the HTTP request and returns its data. 
// Keeping it separate from the hook makes the API details easier to find and reuse.
async function searchBooks(search, { signal }) {
  const searchParams = new URLSearchParams({ search });
  // TanStack Query uses signal to cancel an older request when the search text changes.
  const response = await fetch(`/api/books?${searchParams}`, { signal });

  // fetch only rejects for network errors, so check HTTP status ourselves.
  if (!response.ok) {
    throw new Error("Unable to search books.");
  }

  const books = await response.json();
  if (!Array.isArray(books)) {
    throw new Error("The book search returned an invalid response.");
  }

  return books;
}

// This is a custom React hook: starts with "use"
// Call it at the top level of a component (or another hook), 
// DO NOT call in a condition or event handler. 
export function useBooks(search) {
  const cleanedSearch = search.trim();

  // A query is for reading data from the api server. 
  // TanStack Query runs this function:
  // when enabled, caches the result, and exposes data/loading/error state. 
  // The key identifies which search the cache is for.
  return useQuery({
    queryKey: ["books", cleanedSearch],
    queryFn: ({ signal }) => searchBooks(cleanedSearch, { signal }),
    // Do not send a request for an empty search. Empty string is falsey
    enabled: Boolean(cleanedSearch),
    // Reuse the same search result for five minutes before considering it stale.
    staleTime: 1000 * 60 * 5
  });
}