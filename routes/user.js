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

router.get("/otplogin", (req, res, next) => {
  res.render("users/otpLogin");
});
router.post("/otplogin", sendOtpVerificationEmail, async (req, res, next) => {
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
});
//Otp login has to reworked to
router.post("/otpcomp", async (req, res, next) => {
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
});
// removed isLoggedIn for otp verification,isActive,
router.get("/home",  async (req, res) => {
  const product = await Product.find({});
  const banner = await Banner.find({});
  const banners = banner[0].homeBanner;
  console.log('user bans==',banners)
  console.log('user ban=',banner)

  const user = req.user._id;
  if(user){

      const cart = new Cart({ user });
      const wishlist = new Wishlist({ user});
        await cart.save();
        await wishlist.save();
  }
  
  res.render("home/home", { product,banners  });
});

router.get("/profile", isLoggedIn,async (req, res, next) => {
  const id = req.user._id;
  res.locals.UserId = req.session.username;
  const user = await User.findById(id);
  res.render("users/info", { user });
});
router.get("/profile/info",isLoggedIn, async (req, res) => {
  res.locals.UserId = req.session.username;
  const id = req.user._id;
  const user = await User.findById(id);
  res.render("users/info", { user });
});
router.get("/profile/info/edit", isLoggedIn,async (req, res, next) => {
  res.locals.UserId = req.session.username;
  const id = req.user;
  const user = await User.findById(id);
  res.render("users/infoEdit", { user });
});
router.put(
  "/profile/info/edit",isLoggedIn,
  asyncErrorCatcher(async (req, res, next) => {
    req.flash("error", "This function is Currently Unavailable");
    return res.redirect("/user/profile/info");
    // const {username}=req.body;
    // const id = req.user._id;
    // const regex = /^[a-zA-Z ]*$/;
    // if(regex.test(username)){
    //     console.log(regex.test(username));
    //     const updatedUser = await User.findByIdAndUpdate(id,{username});
    //     console.log(updatedUser);
    //     req.flash('success','Username updated succesfully')
    //     return res.redirect('/user/profile/info');
    // }
    // else{
    //     req.flash('error','Username Is Invalid Try Again');
    //     return res.redirect('/user/profile/info')
    // }
  })
);
router.get("/address",isLoggedIn, async (req, res) => {
  res.locals.UserId = req.user.username;
  const id = req.session.user;

  let useraddress = await Useraddress.findOne({user:id});
  console.log('us',useraddress)
  if(useraddress){
    const address1 = await Useraddress.findOne({user:id}).populate('address');
    const address = address1.address;
    return res.render('users/address',{address});
  }else{
    res.redirect('/user/new/address')
  }

  
});
router.get('/new/address',isLoggedIn,async(req,res)=>{
    res.locals.UserId = req.user.username||'anonymous';
    res.render('users/addressForm');
})
router.post('/new/address',isLoggedIn,async(req,res,next)=>{
    const id = req.session.user;
    console.log(id);
    let addressExist = await Useraddress.findOne({user:id});
    const address = new Address(req.body);
    await address.save();
    if(addressExist){
      const addressId = address._id;
      addressExist.address.push(addressId);
      console.log('address==',addressExist);

      await addressExist.save();
      return res.redirect('/user/address');
    }
    else{
      
      const addressId = address._id;
      const userAddress = new Useraddress({user:id});
      userAddress.address.push(addressId);
      await address.save();
      console.log('userad==',userAddress)
      await userAddress.save();
    }
    console.log(address);
    res.redirect('/user/address');
})
router.get('/address/:id',async(req,res,next)=>{
  const {id} = req.params;
  res.locals.UserId = req.session.username;
  console.log('address id==',id);
  const address = await Address.findById(id);
  console.log('address==',address);
  res.render('users/addressEdit',{address});
})

router.put('/address/:id',async(req,res,next)=>{
  const {id} = req.params;
  res.locals.UserId = req.session.username;
  const editAddrss = await Address.findByIdAndUpdate(id,{...req.body})
  console.log(editAddrss)
  req.flash('success','address updated sucessfully')
  res.redirect('/user/address')
})
router.delete('/address/:id',async(req,res,next)=>{
  const {id} = req.params;
  res.locals.UserId = req.session.username;
  const deleteAddress = await Address.findByIdAndDelete(id);
  req.flash('success','Successfully Deleted');
  res.redirect('/user/address')
})
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
