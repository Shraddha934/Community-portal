import mongoose from "mongoose";

const IssueSchema = new mongoose.Schema(
  {
    issueType: { type: String, required: true },
    image: String,
    location: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
      },
      latitude: Number,
      longitude: Number,
      landmark: String,
      fullAddress: String,
    },
    status: String,
    usermail: String,
    priority: String,
    description: String,
    criticality: String,
    title: String,
    // 🔹 New fields for likes
    likesCount: { type: Number, default: 0 },
    likedBy: { type: [String], default: [] },
    // storing Clerk user IDs or emails

    comments: [
      {
        usermail: { type: String, required: true }, // Clerk email of commenter
        text: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    inProgressOn: { type: Date },
    closedOn: { type: Date },
  },
  { timestamps: true }
);

// 🔹 Add 2dsphere index for geospatial queries
IssueSchema.index({ "location.coordinates": "2dsphere" });

export default mongoose.models.Issue || mongoose.model("Issue", IssueSchema);
