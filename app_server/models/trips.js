const mongoose = require("mongoose");

const tripSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    length: { type: String, required: true, trim: true },
    start: { type: Date, required: true },
    resort: { type: String, required: true, trim: true },
    perPerson: { type: Number, required: true, min: 0 },
    image: { type: String, required: true, trim: true },
    description: { type: String, required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Trip", tripSchema);
