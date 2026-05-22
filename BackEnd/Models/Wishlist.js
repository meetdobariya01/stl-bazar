const mongoose = require("mongoose");
 
const WishlistItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String },
});
 
const WishlistSchema = new mongoose.Schema(
  {
    guestId: { type: String, required: true, unique: true },
    items: [WishlistItemSchema],
  },
  { timestamps: true }
);
 
module.exports = mongoose.model("Wishlist", WishlistSchema);
 