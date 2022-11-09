const express = require("express");
const {
  isLoggedIn,
  isActive,
  isBlocked,
  validateReviewSchema,
} = require("../middleware");
const Cart = require("../model/cart");
const Wishlist = require("../model/wishlist");
const { populate } = require("../model/products");
const Product = require("../model/products");
const router = express.Router();
const mongoose = require("mongoose");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const methodOverride = require("method-override");
const wishlist = require("../model/wishlist");
const Useraddress = require("../model/userAddress");
const Address = require("../model/address");
const Checkout = require("../model/checkout");
const Order = require("../model/order");
const Coupon = require("../model/coupon");
const { compileFunction } = require("vm");
const asyncErrorCatcher = require("../utils/asyncErrorCatcher");

const couponController = require("../controller/product/coupon");
const cartController = require("../controller/product/cart");
const wishListController = require("../controller/product/wishlist");
const checkoutController = require("../controller/product/checkout");
const orderController = require("../controller/product/order");
const paymentController = require("../controller/product/payment");
const productviewController = require("../controller/product/productview");
const reviewController = require("../controller/product/review");

router.use(methodOverride("_method"));

router.get("/cart", isLoggedIn, asyncErrorCatcher(cartController.viewCart));

router.post("/cart/:id", isLoggedIn, asyncErrorCatcher(cartController.addToCart));
router.post("/reduceqty", asyncErrorCatcher(cartController.reduceQty));

router.delete("/cart/:id", isLoggedIn, asyncErrorCatcher(cartController.removeFromCart));
router.post("/cart/remove/:id", asyncErrorCatcher(cartController.removeAsynCart));

router.get("/wishlist", isLoggedIn, asyncErrorCatcher(wishListController.viewWishlist));
router.post("/wishlist/:proid", isLoggedIn, asyncErrorCatcher(wishListController.addToWishlist));
router.delete(
  "/wishlist/:proid",
  isLoggedIn,
  asyncErrorCatcher(wishListController.removeFromWishlist)
);

router.get("/checkout", isLoggedIn, asyncErrorCatcher(checkoutController.viewCheckout));
router.post("/checkout", isLoggedIn, asyncErrorCatcher(checkoutController.addToCheckout));
router.get("/checkout/:id",isLoggedIn, asyncErrorCatcher(checkoutController.singleCheckout));
router.post("/selectaddress",isLoggedIn, asyncErrorCatcher(checkoutController.selectAddress));

router.get("/ordersummary",isLoggedIn, asyncErrorCatcher(orderController.viewOrdersummary));

router.get("/payment",isLoggedIn, asyncErrorCatcher(paymentController.viewPayment));

router.post("/order",isLoggedIn, asyncErrorCatcher(orderController.createOrder));

router.post("/verifypayment",isLoggedIn, asyncErrorCatcher(paymentController.verifyPayment));

router.get('/orderinfo',isLoggedIn, asyncErrorCatcher(orderController.showOrderInfo))

router.get("/ordercompletion",isLoggedIn, asyncErrorCatcher(orderController.showOrdercompletion));

router.post("/coupon",isLoggedIn, asyncErrorCatcher(couponController.applyCoupon));
router.post("/setdiscount",isLoggedIn, asyncErrorCatcher(couponController.setDiscount));

router.get("/:proid/review",isLoggedIn,asyncErrorCatcher(reviewController.renderReviewForm));
router.post(
  "/:proid/review",
  isLoggedIn,
  validateReviewSchema,
  asyncErrorCatcher(reviewController.postReview)
);

router.delete("/:proid/review/:revid",isLoggedIn, asyncErrorCatcher(reviewController.deleteReview));

router.delete("/order/:id",isLoggedIn, asyncErrorCatcher(orderController.deleteOrder));

router.get("/:id", asyncErrorCatcher(productviewController.showProduct));

module.exports = router;
