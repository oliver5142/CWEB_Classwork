import { useEffect, useState } from "react";

export default function App() {
  // Keep the API data and form values in state so React can update the page.
  const [members, setMembers] = useState([]);
  const [books, setBooks] = useState([]);
  const [memberId, setMemberId] = useState("");
  const [bookId, setBookId] = useState("");
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);
  const [optionsError, setOptionsError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    async function loadOptions() {
      try {
        // Load both lists together because the form needs both to be usable.
        const [membersResponse, booksResponse] = await Promise.all([
          fetch("/api/members"),
          fetch("/api/books")
        ]);

        if (!membersResponse.ok || !booksResponse.ok) {
          throw new Error("Unable to load members and available books.");
        }

        // Convert the JSON responses into arrays for the select options.
        const [memberOptions, bookOptions] = await Promise.all([
          membersResponse.json(),
          booksResponse.json()
        ]);

        if (!Array.isArray(memberOptions) || !Array.isArray(bookOptions)) {
          throw new Error("The member and book lists could not be loaded.");
        }

        setMembers(memberOptions);
        setBooks(bookOptions);
      } catch (loadError) {
        setOptionsError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load members and available books."
        );
      } finally {
        setIsLoadingOptions(false);
      }
    }

    loadOptions();
  }, []);

  async function handleSubmit(event) {
    // Handle the form in React instead of letting the browser reload the page.
    event.preventDefault();
    setStatus(null);

    // Do not send a request until both select fields have a value.
    if (!memberId || !bookId) {
      setStatus({
        success: false,
        message: "Please select a member and an available book."
      });
      return;
    }

    // Disable the submit button while the server processes the booking.
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/borrow/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memberId: Number(memberId),
          bookId: Number(bookId)
        })
      });

      if (!response.ok) {
        throw new Error("The borrow request could not be completed.");
      }

      const result = await response.json();
      setStatus(result);
      if (result.success) {
        // A successfully borrowed book is no longer available to select.
        setBookId("");
        setBooks((availableBooks) =>
          availableBooks.filter((availableBook) => String(availableBook.id) !== bookId)
        );
      }
    } catch (submitError) {
      setStatus({
        success: false,
        message: submitError instanceof Error
          ? submitError.message
          : "The borrow request could not be completed."
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="app-shell">
      <div className="booking-page">
        <hr className="my-8 border-t border-gray-200" />

        <section className="page-section">
          <h2 className="section-title">Booking</h2>
          <div className="booking-panel">
            <form className="booking-form" onSubmit={handleSubmit}>
              <div className="form-field">
                <label htmlFor="member">
                  Member
                </label>
                {/* The selected id is stored in state, making this a controlled select. */}
                <select
                  className="autocomplete-input"
                  disabled={isLoadingOptions || Boolean(optionsError)}
                  id="member"
                  name="member"
                  onChange={(event) => setMemberId(event.target.value)}
                  value={memberId}
                >
                  <option value="">
                    {isLoadingOptions ? "Loading members..." : "Select a member"}
                  </option>
                  {/* Use each member id as a stable key when rendering options. */}
                  {members.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-field">
                <label htmlFor="book">
                  Book Title
                </label>
                <select
                  className="autocomplete-input"
                  disabled={isLoadingOptions || Boolean(optionsError)}
                  id="book"
                  name="book"
                  onChange={(event) => setBookId(event.target.value)}
                  value={bookId}
                >
                  <option value="">
                    {isLoadingOptions ? "Loading books..." : "Select a book"}
                  </option>
                  {books.map((book) => (
                    <option key={book.id} value={book.id}>
                      {book.title}
                    </option>
                  ))}
                </select>
              </div>
              <button
                className="booking-button"
                disabled={isLoadingOptions || Boolean(optionsError) || isSubmitting}
                type="submit"
              >
                {isSubmitting ? "Submitting..." : "Check"}
              </button>
            </form>
          </div>
        </section>


        <section className="page-section">
          <h2 className="section-title">Status</h2>
          {/* Live region announces booking results to assistive technologies. */}
          <div aria-live="polite" className="status-panel" role="status">
            <p
              className={`status-message ${
                optionsError
                  ? "text-red-700"
                  : status
                    ? status.success
                      ? "text-green-700"
                      : "text-red-700"
                    : ""
              }`}
            >
              {optionsError || status?.message || "Select a member and book to begin."}
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}