// src/App.jsx
import { useState } from "react";
import Autocomplete from "./components/Autocomplete.jsx";
import { useBooks } from "./services/bookService.js";
import { useBorrowCheck } from "./services/borrowService.js";
import { useMembers } from "./services/memberService.js";
import { Alert, Button, Card, Datepicker } from "flowbite-react";

export default function App() {
  const [member, setMember] = useState(null);
  const [book, setBook] = useState(null);
  const [memberSearch, setMemberSearch] = useState("");
  const [bookSearch, setBookSearch] = useState("");
  const [status, setStatus] = useState(null);
  const membersQuery = useMembers(memberSearch);
  const booksQuery = useBooks(bookSearch);
  const borrowCheck = useBorrowCheck();

  function handleSubmit(event) {
    event.preventDefault();
    setStatus(null);

    if (!member || !book) {
      setStatus({
        success: false,
        message: "Search for and select a member and an available book.",
      });
      return;
    }

    borrowCheck.mutate(
      { memberId: member.id, bookId: book.id },
      {
        onSuccess: (result) => {
          setStatus(result);
          if (result.success) {
            setBook(null);
            setBookSearch("");
          }
        },
        onError: (submitError) => {
          setStatus({
            success: false,
            message:
              submitError instanceof Error
                ? submitError.message
                : "The borrow request could not be completed.",
          });
        },
      },
    );
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
                error={membersQuery.error}
                id="member"
                label="Member"
                onQueryChange={setMemberSearch}
                onSelect={setMember}
                options={membersQuery.data ?? []}
                placeholder="Type a member name"
                query={memberSearch}
                isPending={membersQuery.isPending}
              />
              <Autocomplete
                displayField="title"
                error={booksQuery.error}
                id="book"
                label="Book Title"
                onQueryChange={setBookSearch}
                onSelect={setBook}
                options={booksQuery.data ?? []}
                placeholder="Type a book title"
                query={bookSearch}
                isPending={booksQuery.isPending}
              />
              <Button
                color="green"
                disabled={borrowCheck.isPending}
                fullSized
                type="submit"
              >
                {borrowCheck.isPending ? "Submitting…" : "Check"}
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
        <div className="page-section">
          <Datepicker />
        </div>
      </Card>
    </main>
  );
}
