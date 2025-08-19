const express = require("express");
const Listing = require("../models/listing.js");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js"); // Utility to handle async errors
const { listingSchema, reviewSchema } = require("../schema.js"); // a validation schema defined in utils/validation.js
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const { Cursor } = require("mongoose");
const listingController = require("../controller/listing.js");
const multer = require("multer");
const { cloudinary, storage } = require("../cloudConfig.js"); // Import cloudinary configuration
const upload = multer({ storage });

//Index Route, // Create Route - Handle form submission to create a new listing
router.route("/").get(wrapAsync(listingController.index)).post(
  isLoggedIn,
  validateListing, // Validate the listing data before creating a new listing
  upload.single("image"),
  validateListing, // Validate the listing data before creating a new listing
  wrapAsync(listingController.creatListing)
);

// New Route - Render the form to create a new listing
router.get("/new", isLoggedIn, listingController.renderNewForm);

// Combine Route : Show, Update, Delete
router
  .route("/:id")
  .get(wrapAsync(listingController.showListing))
  .put(
    isLoggedIn,
    isOwner,
    upload.single("image"),
    validateListing, // Validate the listing data before updating
    wrapAsync(listingController.updateListing)
  )
  .delete(isLoggedIn, isOwner, wrapAsync(listingController.destroyListing));

//Show Route
router;

// Edit Route - Render the form to edit an existing listing
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(listingController.renderEditForm)
);

module.exports = router;
