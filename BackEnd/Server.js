// Load environment variables FIRST
const dotenv = require("dotenv");
dotenv.config();

// Debug: Check env variables
// console.log("📧 Environment Check:");
// console.log("   EMAIL_USER:", process.env.EMAIL_USER ? "✅ Loaded" : "❌ Missing");
// console.log("   EMAIL_PASS:", process.env.EMAIL_PASS ? "✅ Loaded" : "❌ Missing");
// console.log("   JWT_SECRET:", process.env.JWT_SECRET ? "✅ Loaded" : "❌ Missing");
// console.log("   GOOGLE_CLIENT_ID:", process.env.GOOGLE_CLIENT_ID ? "✅ Loaded" : "⚠️ Not configured (optional)");

const express = require("express");
const passport = require("passport");
const cors = require("cors");
const path = require("path");
const connectDB = require("./Comfig/db/db");

// Connect DB
connectDB();

// Passport config (this will handle missing credentials gracefully)
require("./Comfig/passport");

const app = express();

// This allows the browser to access images stored in the uploads folder
app.use('/uploads', express.static(path.join("D:\\GourmentBazar\\Vendor\\VendorBackend\\uploads")));

app.use("/images", express.static(path.join(__dirname, "public/images")));
app.use("/images", express.static("D:/GourmentBazar/SuperAdmin/AdminFrontEnd/public/images"));


// app.use("/images/Category", express.static("D:/GourmentBazar/SuperAdmin/AdminFrontEnd/public/images/Category"));
/* ===============================
   MIDDLEWARE
================================ */
app.use(express.json());

app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:3001", "http://localhost:3002"],
  credentials: true
}));

app.use(passport.initialize());

/* ===============================
   ROUTES
================================ */
app.use("/api/auth", require("./Router/authRouter"));
app.use("/api/cart", require("./Router/cartRouter"));
app.use("/api", require("./Router/routerproduct"));
app.use("/api/order", require("./Router/orderRouter"));
app.use("/api/products", require("./Router/reviewRoutes"));
// Add this route
app.use("/api/addresses", require("./Router/addressRouter"));
app.use("/api/wishlist", require("./Router/wishlist"));
app.use("/api/contact", require("./Router/contactRoutes"));
app.use("/api/sellers", require("./Router/sellerRoutes"));
app.use("/api/categories", require("./Router/categoryRoutes"));
app.use('/api/coupons', require('./Router/couponRoutes'));
/* ===============================
   ROOT
================================ */
app.get("/", (req, res) => {
  res.send("API Running...");
});

/* ===============================
   SERVERa
================================ */
const PORT = process.env.PORT || 9000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);