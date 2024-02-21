const router = require("express").Router();
const CLIENT_ID =
  "831170386816-nc4hts2cbl21o5slo4kah59mc1q2i05k.apps.googleusercontent.com";
const CLIENT_SECRET = "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";
const REDIRECT_URI = "https://developers.google.com/oauthplayground";

const REFRESH_TOKEN =
  "1//04ndJ7bFzKndqCgYIARAAGAQSNwF-L9IrRpzre3yKbDTkl5Lhh2giG__S-X0J0AILmneXueTx0AfLXH9V3oF2uc6o4hBycknOnWI";



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
      var payslipSearch = await drive.files.list({
        q: `mimeType='application/vnd.google-apps.folder' and name='${payslip_id}'`,
        fields: "files(id,name)",
      });
  
      console.log({ create3: payslipSearch.data.files });
  
      var payslipFolder = payslipSearch.data.files[0];
  
      if (payslipSearch.data.files.length !== 0) {
        // creating session folder
        let payslipFolderId = payslipFolder.data.id;
          //taking permissions solution folder
          await drive.permissions.create({
            fileId: payslipFolderId,
            requestBody: {
              role: "writer",
              type: "user",
              email:req.body.email_id
            },
          });
        
        const folderLink = await drive.files.get({
          fileId: payslipFolderId,
          fields: "webViewLink",
        });
        const result = await Session.findOneAndUpdate(
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
            type: "user",
            email : req.body.email_id
          },
        });
  
        let payslipFolderId = payslipFolder.data.id;
  
        const folderLink = await drive.files.get({
          fileId: payslipFolderId,
          fields: "webViewLink",
        });
  
        // links end
  
        const result = await Session.findOneAndUpdate(
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
  
      res.status(200).json({ result: "success" });
    } catch (err) {
      console.log("DRIVE HAVE SOME ERROR");
      console.log({ err });
      res.status(500).json(err);
    }
  });

  module.exports = router;
  
  