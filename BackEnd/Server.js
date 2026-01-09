const express = require("express");
const dotenv = require("dotenv");
const passport = require("passport");
const cors = require("cors");
const path = require("path");
const connectDB = require("./Comfig/db/db");

dotenv.config();

// Connect DB
connectDB();

// Passport config
require("./Comfig/passport");

const app = express();
app.use("/images", express.static(path.join(__dirname, "public/images")));
/* ===============================
   MIDDLEWARE
================================ */
app.use(express.json());

app.use(cors({
  origin: "http://localhost:3000", // React frontend
  credentials: true
}));

app.use(passport.initialize());

/* ===============================
   ROUTES
================================ */
app.use("/api/auth", require("./Router/authRouter"));
app.use("/api/cart", require("./Router/cartRouter"));
app.use("/api", require("./Router/routerproduct")); // ✅ PRODUCTS & COMPANIES

/* ===============================
   ROOT
================================ */
app.get("/", (req, res) => {
  res.send("API Running...");
});

/* ===============================
   SERVER
================================ */
const PORT = process.env.PORT;
app.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);
