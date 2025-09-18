import mongoose from "mongoose";

const CorrectedSchema = new mongoose.Schema(
  {
    image: {
      type: String, // base64 string
      required: true,
    },
    predicted: {
      type: String,
      required: true,
      trim: true,
    },
    actual: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

// Avoid recompiling model on hot reload in Next.js
export default mongoose.models.Corrected ||
  mongoose.model("Corrected", CorrectedSchema);
