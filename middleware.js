const ExpressError = require("./utils/ExpressError.js"); // Custom error class for handling errors
const Listing = require("./models/listing.js"); // Assuming you have a Listing model defined in models/listing.js
const Review = require("./models/review.js");
const { listingSchema, reviewSchema } = require("./schema.js");

module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.redirectUrl = req.originalUrl;
    req.flash("error", "You must be logged in to create listing!");
    return res.redirect("/login");
  }
  next();
};

module.exports.saveRedirectUrl = (req, res, next) => {
  if (req.session.redirectUrl) {
    res.locals.redirectUrl = req.session.redirectUrl;
  }
  next();
};

// isOwner function checked is owner and currUser is same or not.
module.exports.isOwner = async (req, res, next) => {
  let { id } = req.params;
  console.log("Updating listing with ID:", id); //Error handling
  let listing = await Listing.findById(id);
  if (!listing.owner._id.equals(res.locals.currUser._id)) {
    req.flash("error", "You are not owner of the listing.");
    return res.redirect("/listings/" + id);
  }
  next();
};

// Validate Listing Middleware
module.exports.validateListing = (req, res, next) => {
  let { error } = listingSchema.validate(req.body); // Validate the request body against the schema

  if (error) {
    let errMsg = error.details.map((el) => el.message).join(", "); // Extract error messages from validation errors
    throw new ExpressError(400, errMsg); // Throw an error if validation fails
  } else {
    next(); // If validation passes, proceed to the next middleware
  }
};

// Validate review middleware
module.exports.validateReview = (req, res, next) => {
  let { error } = reviewSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

// isOwner function checked is owner and currUser is same or not.
module.exports.isReviewAuthor = async (req, res, next) => {
  let { id, reviewId } = req.params;
  let review = await Review.findById(reviewId);
  if (!review) {
    req.flash("error", "Review not found");
    return res.redirect("/listings/" + id);
  }
  let listing = await Review.findById(id);
  if (!review.author.equals(res.locals.currUser._id)) {
    req.flash("error", "You did not create this review.");
    return res.redirect("/listings/" + id);
  }
  next();
};
