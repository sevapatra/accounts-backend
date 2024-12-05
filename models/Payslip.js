const mongoose = require("mongoose");

const Payslip = new mongoose.Schema(
  {
    payslip_id: {
      type: String,
      unique:true
    },
    name: {
      type: String,
    },
    payslipFilledBy: {
      type: String,
    },
    email_id: {
      type: String,
    },
    paymentMethod: {
      type: String,
    },
    department: {
      type: String,
    },
    details: {
      type: String,
    },
    type:{
      type:String
    },
    amount: {
      type: String,
    },
    cost_center: {
      type: String,
    },
    cost_center_to: {
      type: String,
    },
    hod: {
      type: Object,
    },
    status:{
      type:String
    },
    detailContent:{
      type:Array
    },
    folderlink:{
      type:String
    },
    payment_mode:{
      type:String
    },
    verifiedBy:{
      type:String
    },
    cancelledBy:{
      type:String
    },
    bank:{
      type:Object
    },
    queries:{
      type:Array
    },
    previousFormDetails:{
      type:Object
    },
    paymentDate:{
      type:String
    },
    remarks:{
      type:Array
  },
  approvalDate:{
    type:Number
  },
  cancelledDetails:{
    type:Object
  },
  actionDates:{
    type:Object
  },
  tdsAmountDeducted:{
    type:String
  },
  },
  { timestamps: true }
);

module.exports = mongoose.model("payslip", Payslip);
