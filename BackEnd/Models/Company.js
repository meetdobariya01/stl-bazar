const mongoose = require("mongoose");

const CompanySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    description: String,
    logo: String
  },
  { timestamps: true }
);

module.exports = mongoose.model.Company || mongoose.model("Company", CompanySchema);
