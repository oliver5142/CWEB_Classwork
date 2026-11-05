const express = require("express");
const jwt = require("jsonwebtoken");
const { AppDataSource } = require("./data-source");
const { Booking } = require("./entity/Booking");
const { Cab } = require("./entity/Cab");
const { seedDB } = require("./seed-db");
const app = express();
const PORT = 5000;
const passport = require("passport");
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;

const SECRET_KEY = "mySecretKey";

app.use(express.json());

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: SECRET_KEY,
};

passport.use(
  new JwtStrategy(opts, (jwt_payload, done) => {
    if (jwt_payload.username === "user@gmail.com") {
      return done(null, jwt_payload);
    } else {
      return done(null, false);
    }
  }),
);

app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  // Normally check user from DB
  if (username === "user@gmail.com" && password === "1234") {
    const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: "1h" });
    res.json({ token });
  } else {
    res.status(401).json({ error: "Invalid credentials" });
  }
});

app.get("/api/cabs", async (req, res) => {
  try {
    const cabRepo = AppDataSource.getRepository(Cab);
    const cabs = await cabRepo.find();
    res.json(cabs);
  } catch (error) {
    console.error("Fetch cabs error:", error);
    res.status(500).json({ error: "Server error while fetching cabs" });
  }
});

// Protected route
app.post(
  "/api/book-cab",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const { from, to } = req.body;

    if (!from || !to) {
      return res.status(400).json({ error: "From and To are required" });
    }

    const user = req.user.username; // 👈 from JWT

    try {
      const bookingRepo = AppDataSource.getRepository(Booking);
      const booking = await bookingRepo.save(
        bookingRepo.create({ user, from, to }),
      );
      res.status(201).json({
        message: "Cab booked successfully",
        bookingId: booking.id,
        bookedBy: user,
      });
    } catch (error) {
      console.error("Booking error:", error);
      res.status(500).json({ error: "Server error while booking" });
    }
  },
);

app.get(
  "/api/my-rides",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const user = req.user.username; // 👈 from JWT

    try {
      const bookingRepo = AppDataSource.getRepository(Booking);
      const results = await bookingRepo.find({
        where: { user },
        select: { id: true, from: true, to: true },
      });
      res.status(200).json({
        rides: results,
        total: results.length,
      });
    } catch (error) {
      console.error("Fetch rides error:", error);
      res.status(500).json({ error: "Server error while fetching rides" });
    }
  },
);

(async function startServer() {
  try {
    await AppDataSource.initialize(); // connect to sqlite db
    console.log("SQLite database connected");

    await seedDB(); //wipe out db table and re-seed

    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Could not start the server:", error);
    process.exitCode = 1;
  }
})();