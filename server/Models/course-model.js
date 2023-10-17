const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
  // default max min
  id: {
    type: String,
  },
  title: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    require: true,
  },
  description: {
    type: String,
    required: true,
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  students: {
    // array
    type: [String],
    // 預設沒有學生
    default: [],
  },
});

module.exports = mongoose.model("Course", courseSchema);
