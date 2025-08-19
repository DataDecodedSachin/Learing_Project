const Listing = require("../models/listing.js");

// Index Route
module.exports.index = async (req, res) => {
  const allListings = await Listing.find({});
  res.render("./listings/index.ejs", { allListings });
};

// New Route
module.exports.renderNewForm = (req, res) => {
  res.render("./listings/new.ejs");
};

// Show route
module.exports.showListing = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })
    .populate("owner");
  console.log("Total reviews:", listing.reviews.length);
  if (!listing) {
    req.flash("error", "Listing you requested for does not exist!");
    return res.redirect("/listings");
  }
  console.log(listing);
  res.render("./listings/show.ejs", { listing });
};

// Create Route - Handle form submission to create a new listing
module.exports.creatListing = async (req, res, next) => {
  const newListing = new Listing(req.body.listing); // Create a new listing instance'
  newListing.owner = req.user._id;

  if (req.file) {
    let url = req.file.path;
    let filename = req.file.filename;
    console.log(url, "...", filename);
    newListing.image = { url, filename };
  }

  await newListing.save();
  req.flash("success", "New created Listing.");
  res.redirect("/listings");
};

// Edit Route - Render the form to edit an existing listing
module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing you requested for does not exist!");
    res.redirect("/listings");
  }

  let orginalImageUrl = listing.image.url;
  orginalImageUrl = orginalImageUrl.replace("/upload", "/upload/h_200,");
  res.render("./listings/edit.ejs", { listing, orginalImageUrl });
};

// Update Route - Handle form submission to update an existing listing
module.exports.updateListing = async (req, res) => {
  try {
    let { id } = req.params;
    console.log("Updating listing with ID:", id);
    
    // Update the listing with form data first
    let listing = await Listing.findByIdAndUpdate(id, req.body.listing, {
      new: true,
    });
    
    if (!listing) {
      req.flash("error", "Listing not found!");
      return res.redirect("/listings");
    }
    
    // Handle new image upload if provided
    if (req.file) {
      let url = req.file.path;
      let filename = req.file.filename;
      listing.image = { url, filename };
      await listing.save();
    }
    
    req.flash("success", "Updated Listing.");
    res.redirect("/listings/" + id);
  } catch (error) {
    console.error("Error updating listing:", error);
    req.flash("error", "Failed to update listing!");
    res.redirect("/listings");
  }
};


// Delete Route - Handle deletion of a listing
module.exports.destroyListing = async (req, res) => {
  const { id } = req.params;
  console.log("Deleting listing with ID:", id); //Error handling
  let deletedListing = await Listing.findByIdAndDelete(id);
  console.log("Deleted Listing:", deletedListing);
  req.flash("success", "Deleted Listing.");
  res.redirect("/listings");
};
