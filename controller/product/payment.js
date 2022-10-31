const Useraddress = require('../../model/userAddress');
const Checkout = require('../../model/checkout');
const Product = require('../../model/products');
const Cart = require('../../model/cart');
const Address = require('../../model/address');
const Order = require('../../model/order');

const Razorpay = require('razorpay');
const crypto = require('crypto'); 

module.exports.viewPayment = async (req, res) => {
    const user = req.session.user;
    const checkid = req.session.checkoutid;
    const selectaddress = req.session.deliveryaddress;
    //req.session.checkoutType = "single";
    res.locals.checkoutType= req.session.checkoutType;
    res.locals.couponApplied=  req.session.couponApplied;
    res.locals.discountPrize=req.session.discountAmount
    const useraddress = await Useraddress.findOne({ user }).populate("address");
    const address = useraddress.address;
    res.locals.username = req.session.username;
    const deliveryaddress = await Address.findOne({ _id: selectaddress });
    const checkitems = await Checkout.findById({ _id: checkid });
    const item = checkitems.items.slice();
    const bill = checkitems.bill;
    let quantity;
    let totalPrice;
    //let offerPrice;
    let total;
  
  
  
    if (req.session.checkoutType === "single") {
          quantity=checkitems.items.length;
          totalPrice = checkitems.items[0].price;
     
          total = totalPrice ;
   
    }
    else{
  
      const cartFull = await Cart.findOne({ user }).populate({
        path: "user",
        path: "cartItem",
        populate: { path: "product" },
      });
      const items = cartFull.cartItem;
      quantity=cartFull.cartItem.length;
      console.log("cartitems======", items);
      totalPrice = cartFull.bill;
      total = bill ;
  
    }
  
    res.render("products/payment", {
      totalPrice,
      quantity,
      total,
      address,
      deliveryaddress,
      item
      //offerPrice
    });
  }

  module.exports.verifyPayment = async(req,res,next)=>{
    try{
  
      console.log('verify',req.body);
      const {payment,order}= req.body;
       let hmac = crypto.createHmac('sha256','Dnohq7moOUpY7T8Z07Lefcvd')
      hmac.update(payment.razorpay_order_id+'|'+payment.razorpay_payment_id)
      hmac =hmac.digest('hex')
      if(hmac===payment.razorpay_signature){
        console.log('payment success');
        const updatePayStatus = await Order.findOneAndUpdate({_id:order.receipt},{paymentStatus:'completed'})
        res.json({success:true})
      }
      else{
        res.json({success:false})
      }
      //res.send(req.body)
    } catch(e){
      next(e);
    }
  }