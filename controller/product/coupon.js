const Product= require('../../model/products');
const Coupon= require('../../model/coupon');
const Cart= require('../../model/cart');
const session = require('express-session');

module.exports.applyCoupon = async(req,res,next)=>{
    //console.log(req.body);
    const {code,userid} = req.body;
    const user = req.session.user;
    const ucode =code.toUpperCase();
    const checkcode = await Coupon.findOne({code:ucode})
  
  
   
    const couponCheck = await Coupon.aggregate([{$project:{code:1}},{$match:{code:ucode}}])
  
    let offerPrice=false;
    let totalDiscount;
    let isVerified;
    let newToCoupon=true;
    if(checkcode){
       isVerified=true;
  
       const findUser = await Coupon.findOne({code:ucode,customers:{$in:[user]}})
       if(findUser===null){
         isVerified=true;
         newToCoupon=true;
         req.session.code=ucode;
         console.log('type=',typeof findUser)
         console.log('Copon applied succesfully')
         //const updateCust = await Coupon.findOneAndUpdate({code:ucode},{$addToSet:{customers:user}},{upsert:true,new:true})
    
  
              const cart = await Cart.findOne({user:userid});
              let itemPrice = cart.bill;
              console.log('pro',cart);
              const percentage = checkcode.percentage;
              const maxamount = checkcode.amount;
              
                  if(checkcode.isPercent){
                    const percentValue =(percentage/100)*itemPrice;
                    const numberValue = itemPrice-maxamount;
                      if(percentValue<numberValue){
                        offerPrice=numberValue;
                        totalDiscount=itemPrice-offerPrice;
                        console.log('numbervalue=',offerPrice);
                        
                      }else{
                        offerPrice = percentValue;
                        totalDiscount=itemPrice-offerPrice;
                        console.log('percentValue=',offerPrice);
                      }
                  }
                  else{
  
                    const numberValue = itemPrice-maxamount;
                    totalDiscount=maxamount;
                    console.log('only number offer=',numberValue);
                  }
  
        }
        else{
                  newToCoupon=false;
                  //isVerified=false;
                  console.log('Sorry You Already used the coupon!');
                  
        }
  
    }
    else{
      isVerified=false;
      //newToCoupon=false;
      offerPrice=false;
    }
    console.log('offerprice here',newToCoupon)
    console.log('total Discount=',totalDiscount);
    
    res.json({code:ucode,offerPrice,isVerified,totalDiscount,newToCoupon})
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
