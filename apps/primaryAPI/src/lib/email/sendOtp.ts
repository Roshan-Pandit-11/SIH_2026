import nodemailer from 'nodemailer' ;
import { Verification_Email_Template, Welcome_Email_Template } from './emailTemplate.js';
import "dotenv/config";

const user = process.env.NODEMAILER_USER || "roshankr1180@gmail.com" ;
const pass = process.env.NODEMAILER_PASS as string;

const transport = nodemailer.createTransport({
  host : "smtp.gmail.com" ,
  port : 587 ,
  secure : false ,
  auth : {
    user: user,
    pass: pass,
  },
});

export const sendOTP = async (email : string , OTP : string) => {
  try {
    const response = await transport.sendMail({
      from : user ,
      to : email ,
      subject : "Verify Your Email" ,
      text : "Verify Your Email" ,
      html : Verification_Email_Template.replace("{verificationCode}" , OTP) ,
    }) ;
    return ({
      message : response
    }) ;
  } catch (error) {
    console.log(error) ;
    return ({
      error
    }) ;
  }
}

export const sendWelcome = async (email : string , name : string) => {
  try {
    const response = await transport.sendMail({
      from : user ,
      to : email ,
      subject : "Welcome to Worker_SAAS" ,
      text : "Welcome to Worker_SAAS" ,
      html : Welcome_Email_Template.replace("{name}" , name) ,
    }) ;
    return ({
      message : response
    }) ;
  } catch (error) {
    return ({
      error : "Unable to send"
    }) ;
  }
}
