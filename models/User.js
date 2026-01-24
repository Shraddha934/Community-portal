import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true }, // Clerk userId
    name: { type: String },
    email: { type: String },

    role: {
      type: String,
      enum: ["user", "admin", "department"],
      default: "user",
    },

    department: {
      type: String,
      enum: ["DEPT_PWD", "DEPT_WATER", "DEPT_ENV"],
      default: null,
    },

    points: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", UserSchema);
export default User;
