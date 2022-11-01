if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const express = require("express");
const passport = require("passport");
const nodemailer = require("nodemailer");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");
const {
  isLoggedIn,
  isActive,
  userJoiValidation,
  isBlocked,
} = require("../middleware");
const router = express.Router();
const User = require("../model/user");
const session = require("express-session");
const Product = require("../model/products");
const asyncErrorCatcher = require("../utils/asyncErrorCatcher");
const { Otp } = require("../model/otp");
const Cart = require("../model/cart");
const Wishlist = require("../model/wishlist");
const methodOverride = require("method-override");
const Address = require("../model/address");
const Useraddress = require("../model/userAddress");
const Banner = require('../model/banner');
router.use(methodOverride("_method"));

const otpController = require("../controller/user/otpController");
const profileController = require('../controller/user/profileController');
const addressController = require('../controller/user/addressController');

//nodemailer things
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  auth: {
    user: process.env.AUTH_EMAIL,
    pass: process.env.AUTH_PASS,
  },
});

const sendOtpVerificationEmail = async (req, res, next) => {
  try {
    const { _id, email } = req.body;
    const otp = `${Math.floor(1000 + Math.random() * 9000)}`;
    const mailOptions = {
      from: "torrey15@ethereal.email",
      to: email,
      subject: "Verify Your Email",
      html: `<p>Enter <b>${otp}</b> in the app to verify your email address and complete Verification</p>`,
    };
    const saltRounds = 10;
    const hashedOTP = await bcrypt.hash(otp, saltRounds);
    const newOtpVerification = new Otp({
      email: email,
      otp: hashedOTP,
      createdAt: Date.now(),
      expiresAt: Date.now() + 120000,
    });
    await newOtpVerification.save();
    await transporter.sendMail(mailOptions);
    console.log("email has sent");
    req.flash("success", "otp Sent");
    next();
  } catch (error) {
    req.flash("error", "registration failer");
    console.log(error);
    return res.redirect("/user/register");
  }
};


router.get("/register", (req, res) => {
  res.render("users/register");
});
router.post(
  "/register",
  userJoiValidation,
  asyncErrorCatcher(async (req, res, next) => {
    try {
      const { email, username, password, phone } = req.body;
      const user = new User({ email, username, phone });
      const registerUser = await User.register(user, password);
      console.log(registerUser);
      req.login(registerUser, (err) => {
        if (err) return next(err);
        req.session.username = username;
        req.session.user = user._id;
        req.flash("success", "Welcome to Qcart ", req.body.username);
        return res.redirect("/user/home");
      });
    } catch (e) {
      req.flash("error", e.message);
      return res.redirect("/user/register");
    }
  })
);

router.get("/login", (req, res) => {
  if (req.user || req.session.otpVerified) {
    return res.redirect("/user/home");
  }
  res.render("users/login");
});
router.post(
  "/login",
  passport.authenticate("local", {
    failureFlash: true,
    failureRedirect: "/user/login",
  }),
  async(req, res) => {
    const {username}=req.body;
    const user = await User.findByUsername(username)
    console.log(user._id)
    res.locals.UserId = req.user.username;
    req.session.username = req.body.username;
    req.session.user = user._id;
    const cartFull = await Cart.findOne({ user: user._id }).populate({
      path: "user",
      path: "cartItem",
      populate: { path: "product" },
    });
    if(cartFull){
      const cart = cartFull.cartItem;
      req.session.cartcount=cart.length;
    }
    else{
      req.session.cartcount=0;
    }
    console.log(cartFull)
  
    req.flash("success", "Welcome back");
    res.redirect("/user/home");
  }
);

router.get("/otplogin",otpController.renderOtpForm);
router.post("/otplogin", sendOtpVerificationEmail,otpController.otpLogin );
//Otp login has to reworked to
router.post("/otpcomp", otpController.validateOtp );
// removed isLoggedIn for otp verification,isActive,
router.get("/home",  async (req, res) => {
  const product = await Product.find({});
  let banners = await Banner.find({});
  console.log('user bans==',banners)
  if(banners.length<1){
    banners=[{
      bannerName: 'Home Banner',
      mainHeading: 'New Season ',
      subHeading: 'Offer Closes Soon',
      description: 'Buy Every Trendy Pieces At A Surprising Price!!',
      image: [ {url:'https://res.cloudinary.com/dsehj85r6/image/upload/v1666757490/Qcart/yvpa5brqtvobkkle09us.webp',
        filenam:'Qcart/jxc1wbpk77beculapifn'} ]
    }
  ]
  }
  const user = req.session.user;
  if(user){

      const cart = new Cart({ user });
      const wishlist = new Wishlist({ user});
        await cart.save();
        await wishlist.save();
  }
  console.log('bannerhome',banners)
  
  res.render("home/home", { product,banners  });
});

router.get("/profile", isLoggedIn,profileController.showProfile);
router.get("/profile/info",isLoggedIn,profileController.showProfileInfo);
router.get("/profile/info/edit", isLoggedIn,profileController.renderProfileUpdateForm);
router.put(
  "/profile/info/edit",isLoggedIn,
  asyncErrorCatcher(profileController.updateProfile)
);
router.get("/address",isLoggedIn,addressController.showAllAddress );
router.get('/new/address',isLoggedIn,addressController.renderAddressForm)
router.post('/new/address',isLoggedIn,addressController.addAddress)
router.get('/address/:id',isLoggedIn,addressController.showSingleAddress);

router.put('/address/:id',isLoggedIn,addressController.updateAddress);
router.delete('/address/:id',isLoggedIn,addressController.deleteAddress)
router.get("/category/:id", async (req, res) => {
  const { id } = req.params;
  const catList = await Product.find({ category: { $regex: id } });
  const lToH = await Product.find({ category: { $regex: id } }).sort({
    price: 1,
  });
  const hToL = await Product.find({ category: { $regex: id } }).sort({
    price: -1,
  });
  const totalProducts = await Product.countDocuments({
    category: { $regex: id },
  });
  console.log(id);
  res.render("home/categoryList", { catList, id, totalProducts, lToH, hToL });
});
router.get("/logout",isLoggedIn, (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success", "logged out");
    res.redirect("/user/login");
  });
});

module.exports = router;
