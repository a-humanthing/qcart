const Product= require('../../model/products');
const Coupon= require('../../model/coupon');
const Cart= require('../../model/cart');
const session = require('express-session');

module.exports.applyCoupon = async(req,res,next)=>{

}
module.exports.setDiscount=async(req,res,next)=>{
    const {discountAmount,discountTotal}=req.body;
    console.log('body=',req.body);
    req.session.couponApplied=true
    res.locals.couponApplied=req.session.couponApplied
    res.locals.discountPrize=discountAmount
    req.session.discountAmount=discountAmount;
    req.session.discountTotal=discountTotal;
    console.log('sessio',req.session.discountTotal)
    res.json({success:true});
}