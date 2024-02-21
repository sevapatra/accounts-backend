const router = require("express").Router()
const Auth =require("../models/Auth")
const axios = require('axios');
// const { check, validationResult } = require('express-validator');
const JWT = require('jsonwebtoken');
let refreshTokens = [];

const generateAccessToken = (user) => {
  return JWT.sign({ uid: user.uid }, 'mySecretKey', {
    expiresIn: '5s',
  });
};

const generateRefreshToken = (user) => {
  return JWT.sign({ uid: user.uid }, 'myRefreshSecretKey');
};
router.post('/login', async (req, res) => {
    try {
      const adminData = await Auth.find();
      // let agent1=adminData[0]
   
      console.log({adminData})
      if (adminData[0]?.password==req.body.Password && adminData[0]?.admin===req.body.Admin){
        // if (adminData){
          const accessToken = generateAccessToken(adminData);
          const refreshToken = generateRefreshToken(adminData);
          refreshTokens.push(refreshToken);
          res.status(200).json({
            accessToken,
            refreshToken,
            success:true
          });
      }
      else{
        res.status(200).json({success:false});
      }
      
    }
    catch (err) {
      console.log({err})
      res.status(500).json(err);
    }
  });


  
  module.exports =router