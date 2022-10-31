const Otp = require('../../model/otp');
const User = require('../../model/user');
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");
const session = require('express-session')

module.exports.renderOtpForm = async(req, res, next) => {
    res.render("users/otpLogin");
}

module.exports.otpLogin = async (req, res, next) => {
    const { email } = req.body;
    const user = await User.findOne({ email: `${email}` });
    if (user !== null) {
      const data = await Otp.findOne().sort({ createdAt: -1 });
      console.log(data);
      const otp = data.otp;
      res.render("users/otpComp", { otp, email });
    } else {
      req.flash("error", "not a valid email");
      return res.redirect("/user/login");
    }
}

module.exports.validateOtp = async (req, res, next) => {
    const { email, otp } = req.body;
    const data = await Otp.findOne().sort({ createdAt: -1 });
    const user = await User.findOne({ email });
    const hashOtp = data.otp;
    bcrypt.compare(otp, hashOtp, (err, result) => {
      if (result) {
        req.session.otpVerified = true;
        res.locals.UserId = user._id;
        return res.redirect("/user/home");
      } else {
        req.flash("error", "otp validation failed");
        res.redirect("/user/login");
      }
    });
  }
