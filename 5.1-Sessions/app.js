const express = require("express");
const hbs = require("hbs");
const session = require("express-session");
const cookieParser = require("cookie-parser");
// const SqliteStore = require("connect-sqlite3")(session);

const app = express();
const PORT = 5000;
const SECRET_KEY = "super-secret-used-to-sign-session-cookie";

// Store the sessions in an IN-memory db along with
// additonal session options including secret
const sessionOptions = {
//   store: new SqliteStore({ db: "sessions.sqlite" }),
  secret: SECRET_KEY,
  cookie: {
    httpOnly: true, //Hidden from JS on the browser
    maxAge: 1000 * 60 * 60, //1 hour
  },
};

// Handlebars Views setup
app.set("views", "./views");
app.set("view engine", "hbs");

// Middlewares
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(session(sessionOptions));

// Login page
app.get("/login", (req, res) => {
  res.render("login");
});

// Handle login form submit
app.post("/login", (req, res) => {
  const { username } = req.body;

  if (!username) {
    return res.render("login", { error: "Username is required" });
  }

  // Save user in session
  req.session.user = { username }; //object
  req.session.userName = username; //string
  req.session.history = []; //array
  req.session.history.push("Login Page"); // can use  JS array functions

  res.redirect("/dashboard");
});

// Dashboard (protected)
app.get("/dashboard", (req, res) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }
  res.render("dashboard", { user: req.session.user });
});

// Logout
app.post("/logout", (req, res) => {
  // since we are using in memory session store
  // no need to use a callback function
  req.session.destroy((err) => {
    if (err) return res.send("Error logging out");

    res.clearCookie("connect.sid");
    res.redirect("/login");
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
