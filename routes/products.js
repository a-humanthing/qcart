const express = require("express");
const { isLoggedIn, isActive, isBlocked } = require("../middleware");
const Cart = require("../model/cart");
const Wishlist = require("../model/wishlist");
const { populate } = require("../model/products");
const Product = require("../model/products");
const router = express.Router();
const mongoose = require("mongoose");
const Razorpay = require('razorpay');
const crypto = require('crypto'); 
const methodOverride = require("method-override");
const wishlist = require("../model/wishlist");
const Useraddress = require("../model/userAddress");
const Address = require("../model/address");
const Checkout = require("../model/checkout");
const Order = require("../model/order");
const Coupon = require('../model/coupon')
const { compileFunction } = require("vm");

const couponController = require("../controller/product/coupon");
const cartController = require('../controller/product/cart');
const wishListController = require('../controller/product/wishlist');
const checkoutController = require('../controller/product/checkout');
const orderController = require('../controller/product/order');
const paymentController = require('../controller/product/payment');
const productviewController = require('../controller/product/productview');

router.use(methodOverride("_method"));

router.get("/cart", isLoggedIn,cartController.viewCart);

router.post("/cart/:id", isLoggedIn,cartController.addToCart );
router.post("/reduceqty", cartController.reduceQty);

router.delete("/cart/:id", isLoggedIn,cartController.removeFromCart );

router.get("/wishlist", isLoggedIn,wishListController.viewWishlist);
router.post("/wishlist/:proid", isLoggedIn,wishListController.addToWishlist);
router.delete("/wishlist/:proid", isLoggedIn,wishListController.removeFromWishlist );

// router.post("/offerprice", async (req, res) => {
//   console.log('offerprice=',req.body);
//   const {offerPrice}=req.body;
//   res.json({success:true});
// });

router.get("/checkout", isLoggedIn,checkoutController.viewCheckout);
router.post("/checkout", isLoggedIn,checkoutController.addToCheckout);
router.get('/checkout/:id', checkoutController.singleCheckout)
router.post("/selectaddress", checkoutController.selectAddress);

router.get("/ordersummary",orderController.viewOrdersummary);

router.get("/payment",paymentController.viewPayment);

router.post("/order",orderController.createOrder);

router.post('/verifypayment',paymentController.verifyPayment);

// router.post('/onlinepay',async(req,res,next)=>{
//   const online = 'online';
//   res.send({online})
// })

router.get("/ordercompletion", orderController.showOrdercompletion );

router.post('/coupon',couponController.applyCoupon);
router.post('/setdiscount',couponController.setDiscount);



router.delete('/order/:id',orderController.deleteOrder)

router.get("/:id",productviewController.showProduct);

module.exports = router;
