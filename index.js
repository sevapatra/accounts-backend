const express = require("express");
const payslip =require('./routers/payslip');
const auth =require('./routers/auth')
const dotenv=require('dotenv')
const mongoose =require('mongoose')
const app = express();
const helmet = require("helmet");
const morgan = require("morgan");
const cors = require('cors');
const nodemailer= require('nodemailer')
dotenv.config(); 
 
  mongoose.connect(
    process.env.MONGO_URL,
    { useNewUrlParser: true, useUnifiedTopology: true },
    () => {
      console.log("Connected to MongoDB");
    }
  );
 
 
// const connectDatabase = async () => {
//     try {
//       // mongoose.set("useNewUrlParser", true);
      
//       await mongoose.connect(
//         process.env.MONGO_URL,
//         { useNewUrlParser: true, useUnifiedTopology: true , useCreateIndex: true},
//         () => {
//           //console.log("Connected to MongoDB");
//         }
//       );
  
//       //console.log("connected to database");
//     } catch (error) {
//       //console.log(error);
//       process.exit(1);
//     }
//   };
  
//   connectDatabase();


//middleware
app.use(cors())
// app.options('*', cors())
app.use(express.json());
app.use(helmet());
app.use(morgan("common"));
app.use("/api/payslip",payslip)
app.use("/api/auth",auth)
 



// Route to save account data
app.post("/account", async (req, res) => {
  try {
    const { name, accountNumber, ifsc } = req.body;
    const accountData = new AccountData({ name, accountNumber, ifsc });
    await accountData.save();
    res.status(201).json({ message: "Account data saved successfully", accountData });
  } catch (error) {
    res.status(500).json({ message: "Error saving account data", error });
  }
});
const AccountData = require("./models/AccountData");
// Route to get all account data
app.get("/account", async (req, res) => {
  try {
    const accountData = await AccountData.find();
    res.status(200).json(accountData);
  } catch (error) {
    res.status(500).json({ message: "Error fetching account data", error });
  }
});

// Route to delete all account data
app.delete("/account", async (req, res) => {
  try {
    await AccountData.deleteMany({});
    res.status(200).json({ message: "All account data deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting account data", error });
  }
});


const PORT = process.env.PORT || 8600
app.listen(PORT, () => {
  console.log("Backend server is running!", PORT);
});


 