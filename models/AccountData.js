const mongoose = require("mongoose");

const AccountData = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    accountNumber: {
      type: String
    },
    ifsc: {
        type: String
      }
  },
  { timestamps: true }
);

module.exports = mongoose.model("accountdatas", AccountData);