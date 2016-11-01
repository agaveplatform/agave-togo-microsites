'use strict';

var agaveSettings = require('../config/agaveSettings');
var nodemailer    = require('nodemailer');
var sendmailTransport = require('nodemailer-sendmail-transport');

var transporter = nodemailer.createTransport(sendmailTransport());

var emailIO = {};
module.exports = emailIO;

emailIO.sendFeedbackEmail = function(recipientEmail, feedback) {
  var mailOptions = {
    to: recipientEmail,
    subject: 'Agave ToGo Microsite Feedback',
    text: feedback,
  };
  transporter.sendMail(mailOptions,
    function(error, info){
      if(error){
          console.log('Error sending feedback email.', error);
      }
    }
  );
};
