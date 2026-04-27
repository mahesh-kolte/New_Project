 const Listing = require("./models/listing");
  const Review = require("./models/reviews");
const ExpressError = require("./utils/expressError.js");
const { listingSchema, reviewSchema } = require("./schema.js");

// LOGIN CHECK
module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.redirectUrl = req.originalUrl;
    req.flash("error", "You Must Be Logged In");
    return res.redirect("/login");
  }
  next();
};

// SAVE REDIRECT URL
module.exports.saveRedirectUrl = (req, res, next) => {
  if (req.session.redirectUrl) {
    res.locals.redirectUrl = req.session.redirectUrl;
  }
  next();
};

// OWNER CHECK
module.exports.isOwner = async (req, res, next) => {
  let { id } = req.params;
  let listing = await Listing.findById(id);

  if (!listing.owner.equals(res.locals.currUser._id)) {
    req.flash("error", "You don't have permission");
    return res.redirect(`/listings/${id}`);
  }

  next();
};

// VALIDATE LISTING
module.exports.validateListing = (req, res, next) => {
  const { error } = listingSchema.validate(req.body); // ✅ FIXED
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  }
  next();
};

// VALIDATE REVIEW
module.exports.validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body); // ✅ FIXED
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  }
  next();
};

 module.exports.isReviewAuthor = async (req, res, next) => {
  let { id, reviewId } = req.params;
  let review = await Review.findById(reviewId);

  if (!review) {
    req.flash("error", "Review not found!");
    return res.redirect(`/listings/${id}`);
  }

  if (
    !review.author ||
    !res.locals.currUser ||
    !review.author.equals(res.locals.currUser._id)
  ) {
    req.flash("error", "You are not the author of this review!");
    return res.redirect(`/listings/${id}`);
  }

  next();
};
