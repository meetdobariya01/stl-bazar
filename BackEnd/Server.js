
// const dotenv = require("dotenv");
// dotenv.config();

// const express = require("express");
// const passport = require("passport");
// const cors = require("cors");
// const path = require("path");
// const connectDB = require("./Comfig/db/db");
// const shiprocketRouter = require('./Router/shiprocketRouter');


// connectDB();

// // Passport config
// require("./Comfig/passport");
// const app = express();

// // Static files
// app.use('/uploads', express.static(path.join("D:\\GourmentBazar\\Vendor\\VendorBackend\\uploads")));
// app.use("/images", express.static(path.join(__dirname, "public/images")));
// app.use("/images", express.static("D:/GourmentBazar/SuperAdmin/AdminFrontEnd/public/images"));
// app.use("/uploads", express.static(path.join("D:/GourmentBazar/superadmin/AdminBackEnd/public/uploads")));

// /* ===============================
//    MIDDLEWARE
// ================================ */
// app.use(express.json());

// // 🆕 REQUIRED for PayU callbacks (application/x-www-form-urlencoded)
// app.use(express.urlencoded({ extended: true }));

// app.use(cors({
//   origin: [
//     "http://localhost:3000",
//     "http://localhost:3001",
//     "http://localhost:3002",
//     "https://www.native91.com",
//     "https://native91.com",
//     "https://vendor.native91.com",
//     "https://api-admin.native91.com",
//     "https://api-vendor.native91.com",
//     "https://admin.native91.com"
//   ],
//   credentials: true
// }));

// app.use(passport.initialize());

// /* ===============================
//    ROUTES
// ================================ */
// app.use("/api/auth", require("./Router/authRouter"));
// app.use("/api/cart", require("./Router/cartRouter"));
// app.use("/api", require("./Router/routerproduct"));
// app.use("/api/order", require("./Router/orderRouter"));
// app.use("/api/products", require("./Router/reviewRoutes"));
// app.use("/api/addresses", require("./Router/addressRouter"));
// app.use("/api/wishlist", require("./Router/wishlist"));
// app.use("/api/contact", require("./Router/contactRoutes"));
// app.use("/api/sellers", require("./Router/sellerRoutes"));
// app.use("/api/ngos", require("./Router/ngoRoutes"));
// app.use("/api/categories", require("./Router/categoryRoutes"));
// app.use('/api/coupons', require('./Router/couponRoutes'));
// app.use('/api/shiprocket', shiprocketRouter);
// app.use("/api", require("./Router/routerproduct"));
// app.use("/api/careers", require("./Router/careerRoutes"));

// /* ===============================
//    ROOT
// ================================ */
// app.get("/", (req, res) => {
//   res.send("API Running...");
// });

// /* ===============================
//    SERVER
// ================================ */
// const PORT = process.env.PORT || 9000;
// app.listen(PORT, () =>
//   console.log(`Server running on port ${PORT}`)
// );

// Load environment variables FIRST
const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const passport = require("passport");
const cors = require("cors");
const path = require("path");
const cookieParser = require("cookie-parser");                 // 🆕 ADD
const connectDB = require("./Comfig/db/db");
const shiprocketRouter = require("./Router/shiprocketRouter");

connectDB();
require("./Comfig/passport");
const app = express();

// Static files
app.use('/uploads', express.static(path.join("D:\\GourmentBazar\\Vendor\\VendorBackend\\uploads")));
app.use("/images", express.static(path.join(__dirname, "public/images")));
app.use("/images", express.static("D:/GourmentBazar/SuperAdmin/AdminFrontEnd/public/images"));
app.use("/uploads", express.static(path.join("D:/GourmentBazar/superadmin/AdminBackEnd/public/uploads")));

/* ===============================
   MIDDLEWARE
================================ */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());                                       // 🆕 ADD — BEFORE routes

app.use(cors({
  origin: [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:3002",
    "https://www.native91.com",
    "https://native91.com",
    "https://vendor.native91.com",
    "https://api-admin.native91.com",
    "https://api-vendor.native91.com",
    "https://admin.native91.com"
  ],
  credentials: true                                            // ✅ already present
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
app.use("/api/addresses", require("./Router/addressRouter"));
app.use("/api/wishlist", require("./Router/wishlist"));
app.use("/api/contact", require("./Router/contactRoutes"));
app.use("/api/sellers", require("./Router/sellerRoutes"));
app.use("/api/ngos", require("./Router/ngoRoutes"));
app.use("/api/categories", require("./Router/categoryRoutes"));
app.use('/api/coupons', require('./Router/couponRoutes'));
app.use('/api/shiprocket', shiprocketRouter);
app.use("/api", require("./Router/routerproduct"));
app.use("/api/careers", require("./Router/careerRoutes"));
app.use("/api/cookie-consent", require("./Router/cookieRouter"));
/* ===============================
   ROOT
================================ */
app.get("/", (req, res) => {
  res.send("API Running...");
});

/* ===============================
   SERVER
================================ */
const PORT = process.env.PORT || 9000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
