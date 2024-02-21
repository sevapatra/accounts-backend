const mongoose = require("mongoose");

const Hods = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    department: {
      type: String,
    },
    email_id: {
        type: String,
      },
    phone: {
    type: String,
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("hods", Hods);
