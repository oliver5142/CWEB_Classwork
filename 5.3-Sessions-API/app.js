// app.js

const express = require("express");
const session = require("express-session");
const Database = require("better-sqlite3");
const SQLiteStore = require("better-sqlite3-session-store")(session);
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

const { AppDataSource } = require("./data-source");
const { User } = require("./entity/User");
const { seedDB } = require("./seed-db");

const app = express();
const PORT = 5000;
const SECRET_KEY = "super-secret-used-to-encode-session-cookie";

// Configure Sessions: Store the sessions in an sqlite db along with
// additonal session options including secret
const sessionDB = new Database("sessions.sqlite");
const sessionOptions = {
  store: new SQLiteStore({ client: sessionDB }),
  secret: SECRET_KEY,
  cookie: {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 1000,
  },
};

// Configure Passport: use the local strategy and how to de/serialize the user
passport.use(
  new LocalStrategy(
    { usernameField: "email" }, // use email as the username
    async (email, password, done) => {
      try {
        const userRepo = AppDataSource.getRepository(User);
        const userFromDb = await userRepo.findOneBy({
          email: email,
          password: password,
        });
        //next step: serialize User
        return done(null, userFromDb);
      } catch (error) {
        return done(error);
      }
    },
  ),
);

// save JUST the user id in the session database
passport.serializeUser((user, done) => done(null, user.id));

// get the whole user from the app database with the user id stored in the session db
passport.deserializeUser(async (id, done) => {
  try {
    const userRepo = AppDataSource.getRepository(User);
    const userFromDb = await userRepo.findOneBy({ id: Number(id) });
    //save the whole user from the database in req.user
    done(null, userFromDb);
  } catch (error) {
    done(error);
  }
});

// Middlware
app.use(express.json());
app.use(session(sessionOptions));
app.use(passport.initialize());
app.use(passport.session());

function authorizeCurrentUser(req, res, next) {
  if (req.isAuthenticated()) return next();
  return res.status(401).json({ error: "Authentication required" });
}

app.post("/api/login", (req, res, next) => {
  passport.authenticate("local", (error, user) => {
    if (error) return next(error);
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    req.logIn(user, (loginError) => {
      if (loginError) return next(loginError);
      return res.json({ user });
    });
  })(req, res, next);
});

//Unprotected get session store fro user - usually would protect this
app.get("/api/session", (req, res) => {
  res.json({
    authenticated: req.isAuthenticated(),
    user: req.user,
    siteHistory: req.session?.history,
  });
});

//Protected update user's site history this session
app.put("/api/session/history", authorizeCurrentUser, (req, res) => {
  const { currentPage } = req.body;

  if (!currentPage?.trim()) {
    return res.status(400).json({ error: "Invalid content" });
  }

  if (!req.session.history) {
    req.session.history = [];
  }
  req.session.history.push(currentPage);
  return res.json({ siteHistory: req.session.history });
});

app.post("/api/logout", (req, res, next) => {
  req.logout((error) => {
    if (error) return next(error);

    // session stored in db so likely async
    // best to use callback function on session destroy
    req.session.destroy((destroyError) => {
      if (destroyError) return next(destroyError);
      res.clearCookie("connect.sid");
      return res.json({ message: "Logged out" });
    });
  });
});

// DEFAULT ERROR OVERRIDE: passport sends html in error messages need to convert to JSON
app.use((err, req, res, next) => {
  // If headers were already sent, delegate to the default Express handler
  if (res.headersSent) {
    return next(err);
  }

  const statusCode = err.status || err.statusCode || 500;

  // Always return structured JSON
  res.status(statusCode).json({
    success: false,
    error: {
      message: err.message || "Internal Server Error",
      status: statusCode,
    },
  });
});

(async () => {
  try {
    await AppDataSource.initialize(); //connect to db
    await seedDB(); //wipe out and re-seed db tables
    app.listen(PORT, () => {
      console.log(`Game Meet API listening at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Could not start the api-server :", error);
    process.exitCode = 1;
  }
})();
