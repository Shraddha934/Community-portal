import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema(
  {
    usermail: { type: String, required: true }, // who should receive this
    message: { type: String, required: true }, // predefined message
    issueId: { type: mongoose.Schema.Types.ObjectId, ref: "Issue" },
    type: { type: String }, // status_update, like, comment, resolved, etc
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export default mongoose.models.Notification ||
  mongoose.model("Notification", NotificationSchema);
