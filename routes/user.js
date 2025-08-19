const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");
const Listing = require("../models/listing.js");

const userController = require("../controller/users.js");
const User = require("../models/user.js");

// Combine Route : Signup
router
  .route("/signup")
  .get(userController.renderSignupForm)
  .post(wrapAsync(userController.signup));

// Combine Route : Login, Login-checkout
router
  .route("/login")
  .get(userController.renderLoginForm)
  .post(
    saveRedirectUrl,
    passport.authenticate("local", {
      failureRedirect: "/login",
      failureFlash: true,
    }),
    userController.login
  );

// For Logout User Route
router.get("/logout", userController.logout);

module.exports = router;
