const express = require("express");
const router = express.Router();

const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");

const ListingController = require("../controllers/listings.js");

const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const { storage } = require("../cloudConfig.js");
const multer  = require('multer')
const upload = multer({storage})

router
  .route("/")
  .get(wrapAsync(ListingController.index))
  .post(
    isLoggedIn,
     
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(ListingController.createListing),
  );

router.get("/new", isLoggedIn, ListingController.renderNewFrom);

router
  .route("/:id")
  .get(wrapAsync(ListingController.showListing))
  .put(
    isLoggedIn,
    isOwner,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(ListingController.upadateListing),
  )
  .delete(isLoggedIn, isOwner, wrapAsync(ListingController.destroy));

// NEW
 
// SHOW

// CREATE

// EDIT
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(ListingController.renderEditFrom),
);

module.exports = router;
