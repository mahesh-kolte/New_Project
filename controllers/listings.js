const Listing = require("../models/listing");

// module.exports.index = async (req, res) => {
//   const AllListings = await Listing.find({});
//   res.render("listings/index.ejs", { AllListings });
// };
module.exports.index = async (req, res) => {
  let { search } = req.query;

  let AllListings;

  if (search && search.trim() !== "") {
    AllListings = await Listing.find({
      $or: [
        { location: { $regex: search, $options: "i" } },
        { title: { $regex: search, $options: "i" } }
      ]
    });
  } else {
    AllListings = await Listing.find({});
  }

  res.render("listings/index.ejs", { AllListings });
};

module.exports.renderNewFrom = (req, res) => {
  res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
  const listing = await Listing.findById(req.params.id)
    .populate({
      path: "reviews",
      populate: { path: "author" }, // 🔥 important
    })
    .populate("owner");

  if (!listing) {
    req.flash("error", "Listing you requested does not exist!");
    return res.redirect("/listings");
  }

  res.render("listings/show.ejs", { listing });
};

module.exports.createListing = async (req, res) => {
  let url = req.file.path;
  let filename = req.file.filename;
  const newListing = new Listing(req.body.listing);

  newListing.owner = req.user._id; // ✅ FIXED
  newListing.image = { url, filename };
  await newListing.save();

  req.flash("success", "New Listing Created!");
  res.redirect("/listings");
};

module.exports.renderEditFrom = async (req, res) => {
  const listing = await Listing.findById(req.params.id);

  if (!listing) {
    req.flash("error", "Listing you requested does not exist!");
    return res.redirect("/listings");
  }
let currentImageUrl = listing.image.url;
currentImageUrl = currentImageUrl.replace("/upload/", "/upload/w_200/"); // Resize image to width of 200px
  res.render("listings/edit.ejs", { listing , currentImageUrl });
};

module.exports.upadateListing = async (req, res) => {
  let listing = await Listing.findByIdAndUpdate(
    req.params.id,
    req.body.listing,
  );
  if(typeof req.file !== "undefined") {
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = { url, filename };

    await listing.save();
  }
  req.flash("success", "Listing Updated!");
  res.redirect(`/listings/${req.params.id}`);
};

module.exports.destroy = async (req, res) => {
  await Listing.findByIdAndDelete(req.params.id);

  req.flash("success", "Listing Deleted!");
  res.redirect("/listings");
};

 