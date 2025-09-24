import mongoose from "mongoose";
import bcrypt from "bcryptjs";

/**
 * Admin/User schema
 * - name, email, password
 * - role: "admin" or "user"
 * - refreshToken: stores the latest refresh token (for logout/rotation)
 */
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      select: false, // hide password by default
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
    refreshToken: {
      type: String,
      select: false, // hidden, only used server-side
    },
  },
  { timestamps: true }
);

/**
 * Pre-save middleware: hashes password if modified
 */
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(12); // production-grade salt
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

/**
 * Method to compare entered password with hashed password
 */
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;
