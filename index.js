const express = require("express");
const payslip =require('./routers/payslip');
const auth =require('./routers/auth')
const dotenv=require('dotenv')
const mongoose =require('mongoose')
const app = express();
const helmet = require("helmet");
const morgan = require("morgan");
const cors = require('cors');
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
//           console.log("Connected to MongoDB");
//         }
//       );
  
//       console.log("connected to database");
//     } catch (error) {
//       console.log(error);
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

const PORT = process.env.PORT || 8600
app.listen(PORT, () => {
  console.log("Backend server is running!", PORT);
});