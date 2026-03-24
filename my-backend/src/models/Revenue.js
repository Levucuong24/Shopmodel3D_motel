// src/models/Revenue.js
import mongoose from "mongoose";

const schema = new mongoose.Schema({
  month: String,
  amount: Number,
  status: String,
});

export default mongoose.model("Revenue", schema);