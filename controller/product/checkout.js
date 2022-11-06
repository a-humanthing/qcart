const Product = require("../../model/products");
const Cart = require("../../model/cart");
const Checkout = require('../../model/checkout');
const Useraddress = require('../../model/userAddress');
const session = require('express-session');

module.exports.viewCheckout = async (req, res, next) => {
    const user = req.session.user;
    res.locals.username = req.session.username;
    req.session.checkoutType = "cart";
    res.locals.checkoutType= req.session.checkoutType;
    res.locals.couponApplied=  req.session.couponApplied;
    res.locals.discountPrize=req.session.discountAmount
    console.log('hits checkout-------');
    //req.session.itemid=id;
    const cartFull = await Cart.findOne({ user }).populate({
      path: "user",
      path: "cartItem",
      populate: { path: "product" },
    });
    const items = cartFull.cartItem.slice();
    const quantity = cartFull.cartItem.length;
    const totalPrice = cartFull.bill;
    let checkout;
    if(req.session.discountAmount){
      console.log('discount',req.session.discountAmount)
       checkout = await Checkout.create({
        user: user,
        items: items,
        bill: req.session.discountTotal
      });
    }
    else{
  
       checkout = await Checkout.create({
        user: user,
        items: items,
        bill: totalPrice,
      });
    }
    const checkoutid = checkout._id;
    const thischeckout = await Checkout.findById(checkoutid);
    const total = thischeckout.bill
    req.session.checkoutid = checkoutid;
    console.log("cartcheck ==", checkout);
    const useraddress = await Useraddress.findOne({ user }).populate("address");
    let address;
    let isAddressAvailable;
    if(useraddress===null){
      address=[];
      isAddressAvailable=false;
    }else {
      isAddressAvailable=true;
      address = useraddress.address;
    }
    // console.log(useraddress)
    res.render("products/checkout", {
      totalPrice,
      quantity,
      address,
      isAddressAvailable,
      total
    });
  }

  module.exports.addToCheckout = async (req, res, next) => {
    const user = req.session.user;
    const { id,offerPrice } = req.body;
    req.session.checkoutType = "single";
    res.locals.checkoutType= req.session.checkoutType;
    req.session.itemid = id;
    const pro = await Product.findById(id);
    const product = pro._id;
    const price = pro.price;
    const quantity = 1; //should take it dynamically
    const checkout = await Checkout.create({
      user: user,
      
      items: [{ product, quantity, price ,discountPrize:offerPrice,}],
      bill: quantity * price ,
    });
    const checkoutid = checkout._id;
    req.session.checkoutid = checkoutid;
    res.json({success:true});
   
  }

  module.exports.singleCheckout = async(req,res,next)=>{
    const {id} = req.params;
    const user = req.session.user;
    const checkid = req.session.checkoutid;
    req.session.checkoutType = "single";
    res.locals.checkoutType = req.session.checkoutType;
    res.locals.couponApplied=  req.session.couponApplied
    let total;
    const checkout = await Checkout.find({_id:checkid}).populate({path: "items",
    populate: { path: "product" }});
    console.log('checkout==-',checkout);
    const useraddress = await Useraddress.findOne({ user }).populate("address");
    let address;
    let isAddressAvailable;
    console.log('addre',useraddress)
    if(useraddress.length<1){
      address=[];
      isAddressAvailable=false;
    }else {
      isAddressAvailable=true;
      address = useraddress.address;
    }
    console.log('itemsss=',checkout[0].items.length)
    res.locals.username = req.session.username;
  
    const quantity =1;
    const totalPrice = checkout[0].items[0].price;
    total = totalPrice ;
  
    res.render("products/checkout", {
      totalPrice,
      quantity,
      total,
      address,
      isAddressAvailable
    });
  }

  module.exports.selectAddress = async (req, res, next) => {
    const { selectaddress } = req.body;
    const user = req.session.user;
    const id = req.session.checkoutid;
    res.locals.username = req.session.username;
    req.session.deliveryaddress = selectaddress;
    const addresscheckout = await Checkout.findByIdAndUpdate(id, {
      address: selectaddress,
    });
    res.redirect("/product/ordersummary");
  }