import mongoose from "mongoose";

const IssueSchema = new mongoose.Schema(
  {
    issueType: {
      type: String,
      required: true,
      enum: [
        "broken_benches",
        "fallen_trees",
        "garbage",
        "leaky_pipes",
        "open_manhole",
        "potholes",
        "streetlight",
        "others",
      ],
    },
    image: {
      type: String, // store base64 string
      required: true,
    },
    location: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
      landmark: { type: String },
    },
    status: {
      type: String,
      enum: ["open", "inprogress", "resolved"],
      default: "open",
    },
    usermail: {
      type: String,
      required: true,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "low",
    },
    description: {
      type: String,
    },
    criticality: {
      type: String,
      enum: ["Normal", "Critical"],
      default: "Normal",
    },
  },
  { timestamps: true }
);

const Issue = mongoose.models.Issue || mongoose.model("Issue", IssueSchema);

export default Issue;
