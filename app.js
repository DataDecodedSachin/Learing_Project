if (process.env.NODE_ENV !== "production") {
  require("dotenv").config(); // Load environment variables from .env file
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const ejs = require("ejs");
const Listing = require("./models/listing.js"); // Assuming you have a Listing model defined in models/listing.js
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js"); // Utility to handle async errors
const ExpressError = require("./utils/ExpressError.js"); // Custom error class for handling errors
const { listingSchema, reviewSchema } = require("./schema.js"); // a validation schema defined in utils/validation.js
const Review = require("./models/review.js");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const localStrategy = require("passport-local");
const User = require("./models/user.js");

// Routers
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

// Connect to MongoDB
const dbUrl = process.env.ATLASDB_URI;

async function connectDB() {
  await mongoose.connect(dbUrl);
}

connectDB()
  .then(() => {
    console.log("Database connection established");
  })
  .catch((error) => {
    console.error("Database connection failed:", error);
  });

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method")); // For PUT and DELETE requests
app.engine("ejs", ejsMate); // Use ejsMate for layout support
app.use(express.static(path.join(__dirname, "public"))); // Serve static files from the public directory

// Err handling middleware suggest to ChatGpt
app.use((req, res, next) => {
  console.log("👉 Request path:", req.path);
  next();
});

// Session configuration using MongoDB store
const store = MongoStore.create({
  mongoUrl: dbUrl,
  touchAfter: 24 * 3600, // time period in seconds after which the session will be updated
  crypto: {
    secret: "process.env.SECRET",
  },
});

store.on("error", function (e) {
  console.log("Session Store Error", e);
});

// Session Added
const sessionOptions = {
  store: store,
  secret: "process.env.SECRET",
  resave: false,  
  saveUninitialized: true,
};

// Home Route App
// app.get("/", (req, res) => {
//   res.send("Hello I am a simple Express router!");
// });

app.use(session(sessionOptions));
app.use(flash());

// Passport Initialization
app.use(passport.initialize());
app.use(passport.session());

// Configure Passport to use local strategy with User model
passport.use(new localStrategy(User.authenticate()));

// Serialize and Deserialize user
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  console.log(res.locals.success);
  res.locals.currUser = req.user;

  next();
});

// Restructuring Code >> Matching ./routes/listing.js route
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);

// app.get('/testListings', async (req, res) => {
//   let sampleListing = new Listing({
//     title: "Sample Listing",
//     description: "This is a sample listing for testing purposes.",
//     price: 100,
//     location: "Sample Location",
//     country: "Sample Country"
//   });

//   await sampleListing.save();
//   console.log("Sample listing created:", sampleListing);
//   res.send("Sample listing created successfully!");
// });

app.all(/.*/, (req, res, next) => {
  next(new ExpressError(404, "Page Not Found"));
});

app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something went wrong!" } = err;
  res.status(statusCode).render("error.ejs", { message, err }); // Render the error page with the error message
  // res.status(statusCode).send(message);
});

const port = 3000;

app.listen(port, () => {
  console.log(`Server is running on port http://localhost:${port}`);
});
