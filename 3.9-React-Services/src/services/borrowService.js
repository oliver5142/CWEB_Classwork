// src/services/borrowService.js - service modules usually in camel case

import { useMutation } from "@tanstack/react-query";

// This functions is not a search query, this is a form action,
// so it should only run when the user submits the form.
// Keeping it separate from the hook makes the API details easier to find and reuse.
async function checkBorrow({ memberId, bookId }) {
  const response = await fetch("/api/borrow/check", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ memberId, bookId })
  });

  // fetch only rejects for network errors, so check HTTP status ourselves.
  if (!response.ok) {
    throw new Error("The borrow request could not be completed.");
  }

  return response.json();
}


// This is a custom React hook: starts with "use"
// Call it at the top level of a component (or another hook), 
// DO NOT call in a condition or event handler. 
export function useBorrowCheck() {
  // A mutation is for changing data on the api server ( eventually the db). 
  // TanStack runs this function:
  // Unlike a query, this does not run automatically when a component renders.
  return useMutation({ mutationFn: checkBorrow });
}