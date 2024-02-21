const mongoose = require("mongoose");

const Auth = new mongoose.Schema(
  {
    admin: {
      type: String,
    },
    password: {
      type: String
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("auths", Auth);