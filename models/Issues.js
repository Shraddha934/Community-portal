import mongoose from "mongoose";

const IssueSchema = new mongoose.Schema(
  {
    issueType: { type: String, 
      enum:[
        "broken_benches",
        "open_manhole",
        "streetlight",
        "leaky_pipes",
        "garbage",
        "potholes",
        "fallen_trees",
      ],
      required: true },

    // 🔹 NEW FIELD (IMPORTANT)
    department: {
      type: String,
      enum: ["DEPT_PWD", "DEPT_WATER", "DEPT_ENV"],
      required: true,
    },

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

    // 🔹 Likes system (unchanged)
    likesCount: { type: Number, default: 0 },
    likedBy: { type: [String], default: [] },

    // 🔹 Comments (unchanged)
    comments: [
      {
        usermail: { type: String, required: true },
        text: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],

    inProgressOn: { type: Date },
    closedOn: { type: Date },
  },
  { timestamps: true }
);

// 🔹 Geospatial index (keep this exactly)
IssueSchema.index({ "location.coordinates": "2dsphere" });

export default mongoose.models.Issue ||
  mongoose.model("Issue", IssueSchema);
