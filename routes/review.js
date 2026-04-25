 const express = require("express");
const router = express.Router({ mergeParams: true });

const Listing = require("../models/listing.js");
const Review = require("../models/reviews.js");
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/expressError.js");
const { validateReview, isLoggedIn,isReviewAuthor } = require("../middleware.js");
const reviewController = require("../controllers/reviews.js");
// ADD REVIEW
 router.post(
  "/",
  isLoggedIn,
  validateReview,
  wrapAsync(reviewController.createReview)
);

// DELETE REVIEW
router.delete(
  "/:reviewId",
  isLoggedIn,
  isReviewAuthor,
  wrapAsync( reviewController.destroyReview)
);

module.exports = router;