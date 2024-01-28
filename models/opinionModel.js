const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const opinionSchema = new Schema(
  {
    itemID: { type: mongoose.Schema.Types.ObjectId, required: true },
    authorName: { type: String, required: true },
    authorSurname: { type: String, required: true },
    opinionText: { type: String, required: true },
    ratingValue: { type: Number, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Opinion", opinionSchema);