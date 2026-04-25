if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const expressError = require("./utils/expressError.js");

const listingsRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

const flash = require("connect-flash");
const session = require("express-session");
const MongoStore = require("connect-mongo").default;
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

// ================= DB URL =================
const MONGO_URL = process.env.ATLAS_URL;

// ================= VIEW ENGINE =================
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);

// ================= MIDDLEWARE =================
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

// ================= DB CONNECT + SERVER =================
async function main() {
  try {
    await mongoose.connect(MONGO_URL);
    console.log("✅ Connected to MongoDB");

    // ================= SESSION STORE =================
    const store = MongoStore.create({
      mongoUrl: MONGO_URL,
      crypto: {
        secret: process.env.SECRET, // ✅ FIXED
      },
      touchAfter: 24 * 60 * 60,
    });

    store.on("error", (err) => {
      console.log("Session Store Error:", err);
    });

    // ================= SESSION =================
    const sessionOptions = {
      store,
      secret: process.env.SECRET, // ✅ FIXED
      resave: false,
      saveUninitialized: true,
      cookie: {
        expires: Date.now() + 1000 * 60 * 60 * 24 * 3,
        maxAge: 1000 * 60 * 60 * 24 * 3,
        httpOnly: true,
      },
    };

    app.use(session(sessionOptions));
    app.use(flash());

    // ================= PASSPORT =================
    app.use(passport.initialize());
    app.use(passport.session());

    passport.use(new LocalStrategy(User.authenticate()));
    passport.serializeUser(User.serializeUser());
    passport.deserializeUser(User.deserializeUser());

    // ================= GLOBAL VARIABLES =================
    app.use((req, res, next) => {
      res.locals.success = req.flash("success");
      res.locals.error = req.flash("error");
      res.locals.currUser = req.user;
      next();
    });

    // ================= ROUTES =================
    app.use("/listings", listingsRouter);
    app.use("/listings/:id/reviews", reviewRouter);
    app.use("/", userRouter);

    // ================= ERROR HANDLING =================
    app.use((req, res, next) => {
      next(new ExpressError(404, "Page Not Found"));
    });

    app.use((err, req, res, next) => {
      let { statusCode = 500, message = "Something went wrong" } = err;
      res.status(statusCode).render("error.ejs", { message });
    });

    // ================= SERVER START =================
    app.listen(8080, () => {
      console.log("🚀 Server running on port 8080");
    });
  } catch (err) {
    console.log("❌ DB Connection Error:", err);
  }
}

main();
