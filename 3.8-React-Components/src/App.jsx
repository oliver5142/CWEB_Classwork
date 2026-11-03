import { useState } from "react";
import Autocomplete from "./components/Autocomplete.jsx";
import {
  Alert,
  Button,
  Card
} from "flowbite-react";

export default function App() {
  const [member, setMember] = useState(null);
  const [book, setBook] = useState(null);
  const [bookSearchKey, setBookSearchKey] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState(null);

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus(null);

    if (!member || !book) {
      setStatus({
        success: false,
        message: "Search for and select a member and an available book."
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/borrow/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memberId: member.id,
          bookId: book.id
        })
      });

      if (!response.ok) {
        throw new Error("The borrow request could not be completed.");
      }

      const result = await response.json();
      setStatus(result);
      if (result.success) {
        setBook(null);
        setBookSearchKey((key) => key + 1);
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
      <Card className="booking-page">

        <div className="page-section">
          <h1 className="section-title">Booking</h1>
          <div className="panel">
            <form className="booking-form" onSubmit={handleSubmit}>
              <Autocomplete
                displayField="name"
                endpoint="/api/members"
                id="member"
                label="Member"
                onSelect={setMember}
                placeholder="Type a member name"
              />
              <Autocomplete
                displayField="title"
                endpoint="/api/books"
                id="book"
                key={bookSearchKey}
                label="Book Title"
                onSelect={setBook}
                placeholder="Type a book title"
              />
              <Button
                color="green"
                disabled={isSubmitting}
                fullSized
                type="submit"
              >
                {isSubmitting ? "Submitting…" : "Check"}
              </Button>
            </form>
          </div>
        </div>

        <div className="page-section">
          <h2 className="section-title">Status</h2>
          <div className="panel">
            {status ? (
              <Alert color={status.success ? "success" : "failure"}>
                {status.message}
              </Alert>
            ) : (
              <Alert color="info">Search for a member and book to begin.</Alert>
            )}
          </div>
        </div>

      </Card>
    </main>
  );
}