require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../BackEnd/Models/User");

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    const users = await User.find({
      $or: [
        { profilePicture: { $exists: false } },
        { profilePicture: "" },
        { profilePicture: null },
      ],
    });

    console.log(`🔍 Found ${users.length} users without profilePicture`);

    for (const user of users) {
      const seed = user.name || user.email || "User";
      user.profilePicture = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
        seed
      )}&backgroundColor=000000&textColor=ffffff&fontSize=40`;
      await user.save();
      console.log(`✅ Updated: ${user.email}`);
    }

    console.log("🎉 Done!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err);
    process.exit(1);
  }
})();