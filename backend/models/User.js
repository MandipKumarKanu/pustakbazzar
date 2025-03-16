const mongoose = require("mongoose");
const bcryptjs = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    profile: {
      userName: { type: String, required: true, unique: true, trim: true },
      email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
      },
      firstName: { type: String, required: true, trim: true },
      lastName: { type: String, required: true, trim: true },
      profileImg: { type: String, default: "" },
      phNo: { type: String, trim: true },
      address: {
        type: [
          {
            firstName: { type: String, trim: true },
            lastName: { type: String, trim: true },
            street: { type: String, trim: true },
            province: { type: String, trim: true },
            town: { type: String, trim: true },
            landmark: { type: String, trim: true },
            phone: { type: String, trim: true },
            email: { type: String, trim: true, lowercase: true },
            isDefault: { type: Boolean, default: false },
          },
        ],
        validate: [arrayLimit, "{PATH} exceeds the limit of 3"],
      },
      role: { type: String, enum: ["user", "admin"], default: "user" },
    },
    password: { type: String, required: true },
    refreshToken: { type: String, default: null },
    isSeller: {
      status: {
        type: String,
        enum: ["no", "applied", "approved", "rejected"],
        default: "no",
      },
      proofDoc: { type: String, default: "" },
      rating: { type: Number, default: 0, min: 0 },
    },
    bought: [{ type: mongoose.Schema.Types.ObjectId, ref: "Book" }],
    sold: [{ type: mongoose.Schema.Types.ObjectId, ref: "Book" }],
    donated: [{ type: mongoose.Schema.Types.ObjectId, ref: "Book" }],
    savedForLater: [{ type: mongoose.Schema.Types.ObjectId, ref: "Book" }],
    balance: { type: Number, default: 0 },
    earning: { type: Number, default: 0 },
  },
  { timestamps: true }
);

function arrayLimit(val) {
  return val.length <= 3;
}

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcryptjs.genSalt(10);
    this.password = await bcryptjs.hash(this.password, salt);
    next();
  } catch (error) {
    return next(error);
  }
});

userSchema.pre("findOneAndUpdate", async function (next) {
  const update = this.getUpdate();
  if (update.password) {
    try {
      const salt = await bcryptjs.genSalt(10);
      update.password = await bcryptjs.hash(update.password, salt);
      this.setUpdate(update);
    } catch (error) {
      return next(error);
    }
  }
  next();
});

module.exports = mongoose.model("User", userSchema);
