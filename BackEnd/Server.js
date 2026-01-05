const express = require("express");
const dotenv = require("dotenv");
const passport = require("passport");
const connectDB = require("./Comfig/db/db");
const cors = require("cors");

dotenv.config();
connectDB();
require("./Comfig/passport");
const app = express();
app.use(express.json());
app.use(passport.initialize());
app.use(cors({
  origin: "http://localhost:3000", // React frontend URL
  credentials: true
}));
app.use(express.json());


app.use("/api/auth", require("./Router/authRouter"));
app.use("/api/cart", require("./Router/cartRouter"));
app.get("/", (req, res) => {
  res.send("API Running...");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
