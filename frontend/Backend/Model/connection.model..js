import mongoose from "mongoose";

const connectionRequestSchema = mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  connectionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  status_accepted: {
    type: Boolean,
    default: false,
  },
});

const ConnectionRequest = mongoose.model(
  "ConnectionREquest",
  connectionRequestSchema
);

export default ConnectionRequest;
