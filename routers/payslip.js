const router = require("express").Router()
const payslip = require("../models/Payslip");
const hod = require("../models/Hods");
const nodemailer = require("nodemailer")
const {google} =require("googleapis")


// gdrive keys
const CLIENT_ID =
  "921847624592-cq55iqpeql96og5lin2ou8ccq2vaon8j.apps.googleusercontent.com";
const CLIENT_SECRET = "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";
const REDIRECT_URI = "https://developers.google.com/oauthplayground";

const REFRESH_TOKEN =
  "1//04CRcqcmxqOeBCgYIARAAGAQSNwF-L9Irk2uXGKEoG2U8UBBd5XIaV6hadasAkcSGKoQDepWHq3EymjVrGSP1pIlE9xsK8ZAwEXY";



// test api
router.get("/testing", (req, res) => {
  console.log({ success: true })
  res.status(200).json({ success: true })
})


//fetch all data for dashboard from payslip based on status
router.get("/fetch_all_payslip_type1", async (req, res) => {
  try {
    const Pending = await payslip.find({ status: "pending" }).sort({ createdAt: -1 })
    console.log({ pendingTest: Pending })
    const Queried = await payslip.find({ status: "queried" }).sort({ createdAt: -1 })
    console.log({ pendingTest: Queried })
    const Approved = await payslip.find({ status: "approved" }).sort({ createdAt: -1 })
    const Verified = await payslip.find({ status: "verified" }).sort({ createdAt: -1 })
    const PaidButBillPendingPaysl = await payslip.find({ status: "paidButBillPending" }).sort({ createdAt: -1 })
    const Cancelled = await payslip.find({ status: "cancelled" }).sort({ createdAt: -1 })
    const Paid = await payslip.find({ status: "paid" }).sort({ updatedAt: -1 })
    const Settled = await payslip.find({ status: "settled" }).sort({ updatedAt: -1 })
    const Printed = await payslip.find({ status: "printed" }).sort({ updatedAt: -1 })
    // console.log({Pending1})
    // const Pending=[{Asff:"sfsdf"},{aadasd:"ASDD"}]
    res
      .status(200)
      .json({ Pending, Queried, Approved,Verified,Cancelled, PaidButBillPendingPaysl ,Paid, Settled, Printed });
  } catch (err) {
    console.log({ err })
    res.status(500).json(err);
  }
});

//fetch all data
router.get("/fetch_all_payslip", async (req, res) => {
  try {
    const data = await payslip.find()
    res
      .status(200)
      .json({ data });
  } catch (err) {
    console.log({ err })
    res.status(500).json(err);
  }
});

//adding new payslip
router.post("/new_payslip", async (req, res) => {
  try {
    const find_payslip_id = await payslip.find();
    console.log({ find_payslip_id })
    let updated_payslip_id;
    if (find_payslip_id) {
      const pay_id = find_payslip_id[find_payslip_id?.length - 1]?.payslip_id;
      let pay_var = (+pay_id?.slice(5)) + 1
      updated_payslip_id = "PAYSL" + pay_var

    } else {
      updated_payslip_id = "PAYSL1000001";
    }
    const payload = {
      payslip_id: updated_payslip_id,
      name: req.body.name,
      payslipFilledBy :req.body.payslipFilledBy,
      email_id: req.body.email_id,
      phone: req.body.phone,
      department: req.body.department,
      details: req.body.details,
      detailContent: req.body.detailContent,
      previousFormDetails:req.body.previousFormDetails,
      amount: req.body.amount,
      type: req.body.type,
      cost_center: req.body.cost_center,
      cost_center_to: req.body.cost_center_to,
      payment_mode:req.body.payment_mode,
      bank:req.body.bank,
      hod: req.body.hod,
      status: "pending"

    }
    const payslip_add = new payslip(payload);
    const payslip_save = await payslip_add.save()
    res
      .status(200)
      .json({ payslip_save });
  } catch (err) {
    console.log({ err })
    res.status(500).json(err);
  }
});

//fetch data for advance settlement
router.get("/fetch_payslip/:payslip_id", async (req, res) => {
  try {
    const data = await payslip.findOne({
      payslip_id: req.params.payslip_id
    })
    res
      .status(200)
      .json({ data });
  } catch (err) {
    console.log({ err })
    res.status(500).json(err);
  }
});

//fetch data for advance settlement
router.post("/update_payslip/:payslip_id", async (req, res) => {
  try {
    const data = await payslip.updateOne({
      payslip_id: req.params.payslip_id
    }, {

      amount: req.body.amount,
      details: req.body.details,

    }
    )
    res
      .status(200)
      .json({ data });
  } catch (err) {
    console.log({ err })
    res.status(500).json(err);
  }
});



// mail
//send email notification to acc department and person filling form
router.post("/payslip_mail_send", async (req, res) => {
  try {
    // sending mail to tutor
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "iskdhn.technical@gmail.com",
        pass: "dhkotkapeoduhuei",
      },
    });
    var mailList = req.body.email_id;

    let mailOptions = {
      from: "iskdhn.technical@gmail.com",
      to: mailList,
      subject: `${req.body.payslip_id}(New Payslip)`,
      html: `<h1><b>${req.body.payslip_id
        }</b></h1><br/>
        
          Name : ${req.body.name} <br/>
          PayslipFilledBy : ${req.body.payslipFilledBy} <br/>,
          Email : ${req.body.email_id} <br/>
          Phone : ${req.body.phone} <br/>
          Type: ${req.body.type} <br/>
          ${req.body.type=="Internal Transfer" ?  `Cost Center (From) : ${req.body.cost_center}` : `Cost Center : ${req.body.cost_center} `}<br/>
          ${req.body.type=="Internal Transfer" &&  `Cost Center (To) : ${req.body.cost_center_to}   <br/>`}
          Payment Mode: ${req.body.payment_mode} <br/>
          Amount :₹ ${req.body.amount} <br/>
          Details :<br/> ${req.body.details} <br/>
          
        <br /><p>Thanks,</p><p>Accounts Department</p><p>Email: iskdhn.technical@gmail.com, Contact: +917255918744</p><br/><br /><footer><p>Copyright © 2022 ISKCON Dhanbad.<br/> All rights reserved ISKCON Dhanbad</p></footer>`,
    };

    await transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });

    //   if (req.body.medium == "mail") {
    //     const updateSession = await Session.findOneAndUpdate(
    //       { session_id: req.body.sessionId },
    //       {
    //         $push: { notified_tutors: req.body.notified_tutors },
    //       },
    //       {
    //         upsert: true,
    //         new: true,
    //         setDefaultsOnInsert: true,
    //       }
    //     );
    //     console.log(updateSession);
    //   }

    // const updateTutor = await Session.updateOne(
    //   { session_id: req.body.sessionId, "notified_tutors.tutor_id": req.body.tutorId },
    //   { $set: { "notified_tutors.$.medium" : 'wa-mail' } }
    // );

    res.status(200).json("Email sent");
  } catch (err) {
    console.log(err);
    res.status(500).json("Email not sent");
  }
});

//send email notification to acc department and person filling form for advance
router.post("/payslip_mail_send_advance", async (req, res) => {
  try {
    // sending mail to tutor
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "iskdhn.technical@gmail.com",
        pass: "dhkotkapeoduhuei",
      },
    });
    var mailList = [req.body.email_id, 'acc.iskcondhanbad@gmail.com', ];

    let mailOptions = {
      from: "iskdhn.technical@gmail.com",
      to: mailList,
      subject: `${req.body.payslip_id}`,
      html: `<h1><b>${req.body.payslip_id
        }</b>(Advance)</h1><br/>
      
       
        Name : ${req.body.name} <br/>
        PayslipFilledBy : ${req.body.payslipFilledBy} <br/>,
        Email : ${req.body.email_id} <br/>
        Phone : ${req.body.phone} <br/>
        Cost Center : ${req.body.cost_center} <br/>
        Type: ${req.body.type} <br/>
        Payment Mode: ${req.body.payment_mode} <br/>
        Amount :₹ ${req.body.amount} <br/>
        Details :<br/> ${req.body.details} <br/>
        
      <br /><p>Thanks,</p><p>Accounts Department</p><p>Email: iskdhn.technical@gmail.com, Contact: +917255918744</p><br/><br /><footer><p>Copyright © 2022 ISKCON .<br/> All rights reserved ISKCON Dhanbad</p></footer>`,
    };

    await transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });

    //   if (req.body.medium == "mail") {
    //     const updateSession = await Session.findOneAndUpdate(
    //       { session_id: req.body.sessionId },
    //       {
    //         $push: { notified_tutors: req.body.notified_tutors },
    //       },
    //       {
    //         upsert: true,
    //         new: true,
    //         setDefaultsOnInsert: true,
    //       }
    //     );
    //     console.log(updateSession);
    //   }

    // const updateTutor = await Session.updateOne(
    //   { session_id: req.body.sessionId, "notified_tutors.tutor_id": req.body.tutorId },
    //   { $set: { "notified_tutors.$.medium" : 'wa-mail' } }
    // );

    res.status(200).json("Email sent");
  } catch (err) {
    console.log(err);
    res.status(500).json("Email not sent");
  }
});

//send email notification to acc department and person filling form for advance settlement 
router.post("/payslip_mail_send_advanceSettlement", async (req, res) => {
  try {

    const update_advance = await payslip.updateOne({
      payslip_id: req.body.payslip_id
    }, {
      details: req.body.details
    })

    // sending mail to tutor
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "iskdhn.technical@gmail.com",
        pass: "dhkotkapeoduhuei",
      },
    });
    var mailList = [req.body.email_id, 'acc.iskcondhanbad@gmail.com'];

    let mailOptions = {
      from: "iskdhn.technical@gmail.com",
      to: mailList,
      subject: `${req.body.payslip_id}`,
      html: `<h1><b>${req.body.payslip_id
        }</b>(Advance Settlement)</h1><br/>
      
       
        Name : ${req.body.name} <br/>
        PayslipFilledBy : ${req.body.payslipFilledBy} <br/>,
        Email : ${req.body.email_id} <br/>
        Phone : ${req.body.phone} <br/>
        Cost Center : ${req.body.cost_center} <br/>
        Type: ${req.body.type} <br/>
        Payment Mode: ${req.body.payment_mode} <br/>
        Amount :₹ ${req.body.amount} <br/>
        Advance Taken:₹ ${req.body.type === "Advance Settlement" ? req.body?.previousFormDetails?.amount : "Nill"} <br/>
        Details :<br/> ${req.body.details} <br/>
        
      <br /><p>Thanks,</p><p>Accounts Department</p><p>Email: iskdhn.technical@gmail.com, Contact: +917255918744</p><br/><br /><footer><p>Copyright © 2022 ISKCON .<br/> All rights reserved ISKCON Dhanbad</p></footer>`,
    };

    await transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });

    //   if (req.body.medium == "mail") {
    //     const updateSession = await Session.findOneAndUpdate(
    //       { session_id: req.body.sessionId },
    //       {
    //         $push: { notified_tutors: req.body.notified_tutors },
    //       },
    //       {
    //         upsert: true,
    //         new: true,
    //         setDefaultsOnInsert: true,
    //       }
    //     );
    //     console.log(updateSession);
    //   }

    // const updateTutor = await Session.updateOne(
    //   { session_id: req.body.sessionId, "notified_tutors.tutor_id": req.body.tutorId },
    //   { $set: { "notified_tutors.$.medium" : 'wa-mail' } }
    // );

    res.status(200).json("Email sent");
  } catch (err) {
    console.log(err);
    res.status(500).json("Email not sent");
  }
});

// send mail to hod
router.post("/payslip_mail_send_hod", async (req, res) => {
  try {
    // sending mail to tutor
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "iskdhn.technical@gmail.com",
        pass: "dhkotkapeoduhuei",
      },
    });
    // var mailList = 'shiv7255918@gmail.com';

    let mailOptions = {
      from: "iskdhn.technical@gmail.com",
      to: req.body.hod==="HG Damodar Govind Pr"? "Damodargovinddas.rns@gmail.com" : "hgsapapproval@gmail.com" ,
      subject: `${req.body.payslip_id}(New Payslip Approval)`,
      html: `<h1><b>${req.body.payslip_id
        }</b></h1><br/>
      
       
        Name : ${req.body.name} <br/>
        PayslipFilledBy : ${req.body.payslipFilledBy} <br/>,
        Type: ${req.body.type} <br/>
        ${req.body.type=="Internal Transfer" ?  `Cost Center (From) : ${req.body.cost_center}` : `Cost Center : ${req.body.cost_center} `}<br/>
        ${req.body.type=="Internal Transfer" &&  `Cost Center (To) : ${req.body.cost_center_to}   <br/>`}
        Payment Mode: ${req.body.payment_mode} <br/>
        Amount :₹ ${req.body.amount} <br/>
      ${req.body.type === "Advance Settlement" && `Advance Taken:₹ ${req.body?.previousFormDetails?.amount}<br/>`} 
        Details :<br/> ${req.body.details} <br/>

        <button  id="approve"><a href="https://iskdhnaccountsdashboard-nr23mxt4ma-de.a.run.app/hod/approvalPage/${req.body.payslip_id}" style="text-decoration: none;">Approve</button>${" "}<button id="raiseQuery"><a href="https://iskdhnaccountsdashboard-nr23mxt4ma-de.a.run.app/hod/queryPage/${req.body.payslip_id}" style="text-decoration: none;">Raise Query</button>
        
      <br /><p>Thanks,</p><p>Accounts Department</p><p>Email: iskdhn.technical@gmail.com, Contact: +917255918744</p><br/><br /><footer><p>Copyright © 2022 ISKCON .<br/> All rights reserved ISKCON Dhanbad</p></footer>`,
    };

    await transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });

    //   if (req.body.medium == "mail") {
    //     const updateSession = await Session.findOneAndUpdate(
    //       { session_id: req.body.sessionId },
    //       {
    //         $push: { notified_tutors: req.body.notified_tutors },
    //       },
    //       {
    //         upsert: true,
    //         new: true,
    //         setDefaultsOnInsert: true,
    //       }
    //     );
    //     console.log(updateSession);
    //   }

    // const updateTutor = await Session.updateOne(
    //   { session_id: req.body.sessionId, "notified_tutors.tutor_id": req.body.tutorId },
    //   { $set: { "notified_tutors.$.medium" : 'wa-mail' } }
    // );

    res.status(200).json("Email sent");
  } catch (err) {
    console.log(err);
    res.status(500).json("Email not sent");
  }
});

//send email notification to acc department and person filling form when it is approved
router.post("/payslip_approved", async (req, res) => {
  try {
    // sending mail to tutor
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "iskdhn.technical@gmail.com",
        pass: "dhkotkapeoduhuei",
      },
    });
    var mailList = [req.body.email_id, 'acc.iskcondhanbad@gmail.com'];

    let mailOptions = {
      from: "iskdhn.technical@gmail.com",
      to: mailList,
      subject: `${req.body.payslip_id}(Approved)`,
      html: `<h3>Request with payslip id <b>${req.body.payslip_id}</b> is <b> Approved</b></h3><br/>
        
       
      Name : ${req.body.name} <br/>
      PayslipFilledBy : ${req.body.payslipFilledBy} <br/>,
      Email : ${req.body.email_id} <br/>
      Phone : ${req.body.phone} <br/>
      Type: ${req.body.type} <br/>
      ${req.body.type=="Internal Transfer" ?  `Cost Center (From) : ${req.body.cost_center}` : `Cost Center : ${req.body.cost_center} `}<br/>
      ${req.body.type=="Internal Transfer" &&  `Cost Center (To) : ${req.body.cost_center_to}   <br/>`}
      Payment Mode: ${req.body.payment_mode} <br/>
      Amount :₹ ${req.body.amount} <br/>
      Advance Taken:₹ ${req.body.type === "Advance Settlement" ? req.body?.previousFormDetails?.amount : "Nill"} <br/>
      Details :<br/> ${req.body.details} <br/>
        
      <br /><p>Thanks,</p><p>Accounts Department</p><p>Email: iskdhn.technical@gmail.com, Contact: +917255918744</p><br/><br /><footer><p>Copyright © 2022 ISKCON .<br/> All rights reserved ISKCON Dhanbad</p></footer>`,
    };

    await transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });

    await payslip.updateOne({
      payslip_id: req.body.payslip_id
    }, {
      status: req.body.status,
      approvalDate :Date.now()
    })

    res.status(200).json("Email sent");
  } catch (err) {
    console.log(err);
    res.status(500).json("Email not sent");
  }
});

//send email notification to acc department and person filling form when query is raised
router.post("/payslip_query_raised", async (req, res) => {
  try {
    // sending mail to tutor
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "iskdhn.technical@gmail.com",
        pass: "dhkotkapeoduhuei",
      },
    });
    var mailList = req.body.email_id;

    let mailOptions = {
      from: "iskdhn.technical@gmail.com",
      to: mailList,
      subject: `${req.body.payslip_id}(Query Raised)`,
      html: `<h3>HOD has been queried on your payslip no. <b>${req.body.payslip_id}</b></h3><br/>

      <b>Query</b><br/>
        <p>${req.body.query}</p><br/>
       <p style="color:light-gray" >
       
       Name : ${req.body.name} <br/>
       PayslipFilledBy : ${req.body.payslipFilledBy} <br/>,
       Email : ${req.body.email_id} <br/>
       Phone : ${req.body.phone} <br/>
       Type: ${req.body.type} <br/>
       ${req.body.type=="Internal Transfer" ?  `Cost Center (From) : ${req.body.cost_center}` : `Cost Center : ${req.body.cost_center} `}<br/>
       ${req.body.type=="Internal Transfer" &&  `Cost Center (To) : ${req.body.cost_center_to}   <br/>`}
       Payment Mode: ${req.body.payment_mode} <br/>
       Amount :₹ ${req.body.amount} <br/>
       Advance Taken:₹ ${req.body.type === "Advance Settlement" ? req.body?.previousFormDetails?.amount : "Nill"} <br/>
       Details :<br/> ${req.body.details} <br/>
     
        </p>
      <br /><p>Thanks,</p><p>Accounts Department</p><p>Email: iskdhn.technical@gmail.com, Contact: +917255918744</p><br/><br /><footer><p>Copyright © 2022 ISKCON .<br/> All rights reserved ISKCON Dhanbad</p></footer>`,
    };

    await transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });

    //   if (req.body.medium == "mail") {
    //     const updateSession = await Session.findOneAndUpdate(
    //       { session_id: req.body.sessionId },
    //       {
    //         $push: { notified_tutors: req.body.notified_tutors },
    //       },
    //       {
    //         upsert: true,
    //         new: true,
    //         setDefaultsOnInsert: true,
    //       }
    //     );
    //     console.log(updateSession);
    //   }

    // const updateTutor = await Session.updateOne(
    //   { session_id: req.body.sessionId, "notified_tutors.tutor_id": req.body.tutorId },
    //   { $set: { "notified_tutors.$.medium" : 'wa-mail' } }
    // );
    await payslip.updateOne({
      payslip_id: req.body.payslip_id
    }, {
      status: req.body.status
    })
    res.status(200).json("Email sent");
  } catch (err) {
    console.log(err);
    res.status(500).json("Email not sent");
  }
});

// update status of payslip
router.post("/queryReply", async (req, res) => {

  try {
    // sending mail to tutor
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "iskdhn.technical@gmail.com",
        pass: "dhkotkapeoduhuei",
      },
    });
    // var mailList = ['iskdhn.technical@gmail.com'];

    let mailOptions = {
      from: "iskdhn.technical@gmail.com",
      to: req.body.hod==="HG Damodar Govind Pr"? "Damodargovinddas.rns@gmail.com" : "hgsapapproval@gmail.com" ,
      subject: `${req.body.payslip_id}(Reply to query)`,
      html: `<h3>Reply from Accounts Department on a query in payslip no. <b>${req.body.payslip_id}</b></h3><br/>

      <b>Query</b><br/>
        <p>${req.body.query_value}</p><br/>
        <b>Reply</b><br/>
        <p>${req.body.query_reply}</p><br/>
       <p style="color:light-gray" >
       
       Name : ${req.body.name} <br/>
       PayslipFilledBy : ${req.body.payslipFilledBy} <br/>,
       Email : ${req.body.email_id} <br/>
       Phone : ${req.body.phone} <br/>
       Type: ${req.body.type} <br/>
       ${req.body.type=="Internal Transfer" ?  `Cost Center (From) : ${req.body.cost_center}` : `Cost Center : ${req.body.cost_center} `}<br/>
       ${req.body.type=="Internal Transfer" &&  `Cost Center (To) : ${req.body.cost_center_to}   <br/>`}
       Payment Mode: ${req.body.payment_mode} <br/>
       Amount :₹ ${req.body.amount} <br/>
       Advance Taken:₹ ${req.body.type === "Advance Settlement" ? req.body?.previousFormDetails?.amount : "Nill"} <br/>
       Details :<br/> ${req.body.details} <br/>
     
        </p>
      <br /><p>Thanks,</p><p>Accounts Department</p><p>Email: iskdhn.technical@gmail.com, Contact: +917255918744</p><br/><br /><footer><p>Copyright © 2022 ISKCON .<br/> All rights reserved ISKCON Dhanbad</p></footer>`,
    };

    await transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });

    const queryReply = await payslip.updateOne({
      payslip_id: req.body.payslip_id,
      "queries.query_no": req.body.query_no
    },
      { $set: { "queries.$.query_reply": req.body.query_reply } }
      // { arrayFilters: [{ "element.query_no": req.body.query_no }] }
    )
    if (queryReply) {
      res.status(200).json({ success: true })
    }


  } catch (error) {
    console.log({ error })
    res.status(500).json({ error })
  }

})
// mail end



// update status of payslip
router.put("/updateStatus", async (req, res) => {
  try {
    const updateStatus = await payslip.updateOne({ payslip_id: req.body.payslip_id }, {
      status: req.body.updatedStatus,
      verifiedBy:req?.body?.verifiedBy  ? req?.body?.verifiedBy : null,
      cancelledBy:req?.body?.cancelledBy ? req?.body?.cancelledBy : null
    })
    if (updateStatus) {
      res.status(200).json({ success: true })
    }
  } catch (error) {
    console.log({ error })
    res.status(500).json({ error })
  }

})

// update payment date and remarks of payslip
router.put("/updatePaymentDateAndRemarks", async (req, res) => {
  try {
    const paidInfo = await payslip.updateOne({ payslip_id: req.body.payslip_id }, {
      paymentDate: req.body.paymentDate,
      $push:{remarks:req.body.remark}
    })
    if (paidInfo) {
      res.status(200).json({ success: true })
    }
  } catch (error) {
    console.log({ error })
    res.status(500).json({ error })
  }
})

router.post("/payslip_mail_send_paid_sections", async (req, res) => {
  try {
    // sending mail to tutor
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "iskdhn.technical@gmail.com",
        pass: "dhkotkapeoduhuei",
      },
    });
    var mailList = req.body.email_id;

    let mailOptions = {
      from: "iskdhn.technical@gmail.com",
      to: mailList,
      subject: `${req.body.payslip_id}(Amount Paid)`,
      html: `<h1 style="color: green"><b> Payment Done(Kindly Check Payment Date & Transaction ID below) ${req.body.status === "paidButBillPending" ? "(Bill Is Pending)" : ""}</b></h1><br/>
                <h1 style="color: green"><b>Payment Date: ${req.body.paymentDate}<b><br/></h1>
                <h1 style="color: green"><b>Transaction Id: ${req.body.remark ? req.body.remark : "NA"}<b><br/></h1><br/>

          Payslip Id: ${req.body.payslip_id}<br/>
          Name : ${req.body.name} <br/>
          Payslip Filled By : ${req.body.payslipFilledBy} <br/>
          Email : ${req.body.email_id} <br/>
          Phone : ${req.body.phone} <br/>
          Type: ${req.body.type} <br/>
          ${req.body.type=="Internal Transfer" ?  `Cost Center (From) : ${req.body.cost_center} - (To) : ${req.body.cost_center_to}` : `Cost Center : ${req.body.cost_center} `}<br/>
          Payment Mode: ${req.body.payment_mode} <br/>
          Amount :₹ ${req.body.amount} <br/>
          Details :<br/> ${req.body.details} <br/>
          
        <br /><p>Thanks,</p><p>Accounts Department</p><p>Email: iskdhn.technical@gmail.com, Contact: +917644070770</p><br/><br /><footer><p>Copyright © 2022 ISKCON Dhanbad.<br/> All rights reserved ISKCON Dhanbad</p></footer>`,
    };

    await transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });

    res.status(200).json("Email sent");
  } catch (err) {
    console.log(err);
    res.status(500).json("Email not sent");
  }
});

// build folder in google drive
router.post("/folderBuilder", async (req, res) => {
  // let clientId = req.body.clientId;
  let payslip_id = req.body.payslip_id;



  const oauth2client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI
  );
  oauth2client.setCredentials({ refresh_token: REFRESH_TOKEN });

  const drive = google.drive({
    version: "v3",
    auth: oauth2client,
  });

  try {
    let folderLink;
    var payslipSearch = await drive.files.list({
      q: `mimeType='application/vnd.google-apps.folder' and name='${payslip_id}'`,
      fields: "files(id,name)",
    });

    console.log({ create3: payslipSearch.data.files });

    var payslipFolder = payslipSearch.data.files[0];

    if (payslipSearch.data.files.length !== 0) {
      // creating session folder
      let payslipFolderId = payslipFolder.id;
        //taking permissions solution folder
        await drive.permissions.create({
          fileId: payslipFolderId,
          requestBody: {
            role: "writer",
            type: "anyone",
            // emailAddress:req.body.email_id
          },
        });
      
       folderLink = await drive.files.get({
        fileId: payslipFolderId,
        fields: "webViewLink",
      });
      const result = await payslip.findOneAndUpdate(
        { payslip_id: payslip_id },
        {
          folderlink: folderLink.data.webViewLink,
        },
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true,
        }
      );
      console.log("result:", result);
     
    } else {
      let payslipFolder = await drive.files.create({
        resource: {
          name: `${payslip_id}`,
          mimeType: "application/vnd.google-apps.folder",
        },
        fields: "id",
      });
      await drive.permissions.create({
        fileId: payslipFolder.data.id,
        requestBody: {
          role: "writer",
          type: "anyone",
          // emailAddress : req.body.email_id
        },
      });

      let payslipFolderId = payslipFolder.data.id;

       folderLink = await drive.files.get({
        fileId: payslipFolderId,
        fields: "webViewLink",
      });

      // links end

      const result = await payslip.findOneAndUpdate(
        { payslip_id: payslip_id },
        {
          folderlink: folderLink.data.webViewLink,
        },
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true,
        }
      );
      console.log("result:", result);
      console.log("working session backend");
    }
    console.log({folderLink})
    res.status(200).json({ result: "success",folderLink });
  } catch (err) {
    console.log("DRIVE HAVE SOME ERROR");
    console.log({ err });
    res.status(500).json(err);
  }
});

// update payment date and remarks of payslip
router.get("/changeNaRemarksToAr", async (req, res) => {
  try {
    const findArNa = await payslip.find({remarks:"NA"})
    const paidInfo = await payslip.updateMany({ remarks: "NA" }, {
      $set:{remarks:[]}
    })
    if (paidInfo) {
      res.status(200).json({ success: true , findArNa})
    }
  } catch (error) {
    console.log({ error })
    res.status(500).json({ error })
  }
})


module.exports = router
