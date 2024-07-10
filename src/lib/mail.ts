import nodemailer from 'nodemailer';

export async function getMailClient(){

  const transporter = nodemailer.createTransport({
    host : "email-smtp.us-east-1.amazonaws.com",
    port : 587,
    secure : false, 
    auth : {
      user : "AKIAWQXBAZRLI3FX46FI",
      pass : "BLzWTYOcrTNwFCRfZXomdBaEq4+wdffqYY02yjNk9N3f"
    },
  });

  return transporter
}

