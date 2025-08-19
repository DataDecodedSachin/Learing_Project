const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js"); // Utility   handle async errors
const ExpressError = require("../utils/ExpressError.js"); // Custom error class for handling errors
const Listing = require("../models/listing.js"); // Assuming you have a Listing model defined in models/listing.js
const Review = require("../models/review.js");
const {
  validateReview,
  isLoggedIn,
  isReviewAuthor,
} = require("../middleware.js");

const reviewController = require("../controller/reviews.js");

// Review Route - for special listing
router.post(
  "/",
  isLoggedIn,
  validateReview,
  wrapAsync(reviewController.createReview)
);

// Review inside Delete Route
router.delete("/:reviewId", wrapAsync(reviewController.destroyReview));

module.exports = router;
