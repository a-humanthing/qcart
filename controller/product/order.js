const Useraddress = require('../../model/userAddress');
const Checkout = require('../../model/checkout');
const Product = require('../../model/products');
const Cart = require('../../model/cart');
const Address = require('../../model/address');
const Order = require('../../model/order');
const Coupon = require('../../model/coupon');
const Razorpay = require('razorpay');
const mongoose = require('mongoose');

module.exports.viewOrdersummary = async (req, res, next) => {
    const user = req.session.user;
    res.locals.username = req.session.username;
    const selectaddress = req.session.deliveryaddress;
    const checkid = req.session.checkoutid;
  
    res.locals.couponApplied=  req.session.couponApplied;
    res.locals.discountPrize=req.session.discountAmount
  
    console.log("type:", req.session.checkoutType);
  
    if (req.session.checkoutType === "single") {
      const useraddress = await Useraddress.findOne({ user }).populate("address");
      const address = useraddress.address;
      const id = req.session.itemid;
      res.locals.username = req.session.username;
  
      
      res.locals.checkoutType= req.session.checkoutType;
  
      const checkitems = await Checkout.findById({ _id: checkid });
      //const item = checkitems.items.slice();
      const bill = checkitems.bill;
      const quantity = checkitems.items.length;
      const totalPrice = checkitems.items[0].price;
      let total;
      total = totalPrice ;
      const item = await Product.findById(id);
      const deliveryaddress = await Address.findOne({ _id: selectaddress });
      console.log("Delivery ===", deliveryaddress);
      return res.render("products/ordersummary", {
        item,
        totalPrice,
        quantity,
        total,
        deliveryaddress,
        //offerPrice
      });
    } else {
      const cartFull = await Cart.findOne({ user }).populate({
        path: "user",
        path: "cartItem",
        populate: { path: "product" },
      });
      res.locals.checkoutType= req.session.checkoutType;
      const items = cartFull.cartItem;
      console.log("cartitems======", items);
      const quantity = cartFull.cartItem.length;
      const totalPrice = cartFull.bill;
      const checkoutid=  req.session.checkoutid
      const thischeckout = await Checkout.findById(checkoutid);
      const total = thischeckout.bill;
      const deliveryaddress = await Address.findOne({ _id: selectaddress });
      console.log("Delivery ===", deliveryaddress);
      res.render("products/ordersummarycart", {
        items,
        totalPrice,
        quantity,
        total,
        deliveryaddress,
      });
    }
  }
module.exports.createOrder =   async (req, res) => {
    const { paymethod } = req.body;
    const user = req.session.user;
    const checkid = req.session.checkoutid;
    const addressid = req.session.deliveryaddress;
    const checkout = await Checkout.findById({ _id: checkid });
    const items = checkout.items.slice();
    const bill = checkout.bill;
    const address = checkout.address;
  
    let totalPrice;
    let offerPrice;
    let total;
    totalPrice = checkout.items[0].price;
  
    const quantity = checkout.items.length;
    let order;
          total = totalPrice ;
           order = await Order.create({
            user: user,
            items: items,
            checkoutid: checkid,
            bill: bill,
            address: addressid,
            paymentStatus: "pending",
            paymentType: paymethod,
            orderStatus: [{ type: "ordered", date: new Date() }],
          });
     
  
      console.log('last total',total)
      
    req.session.orderid = order._id;
    const orderid= order._id;
    const deleteCheck = await Checkout.findOneAndDelete({user:user})
    console.log('session=',req.session.checkoutType)
    if(req.session.checkoutType==='cart'){
      const deleteCart = await Cart.findOneAndDelete({user:user})
    }
    if (paymethod === "cod") {
      req.flash('success','Ordered Successfully')
      return res.json({cod:true})
      //return res.redirect("/product/ordercompletion");
      //return res.render('products/ordersuccess',)
    } else {
  
      const instance = new Razorpay({
        key_id: 'rzp_test_Bpo2tXK3kjU30H',
        key_secret: 'Dnohq7moOUpY7T8Z07Lefcvd',
      });
    
      let options = {
        amount: bill*100,  // amount in the smallest currency unit
        currency: "INR",
        receipt: `${order._id}`
      };
      instance.orders.create(options, function(err, order) {
        if(err){
          res.send(err)
        }else{
  
            //console.log(order)
            res.json({order});
        }
      });
  
      
    }
  }

module.exports.deleteOrder = async(req,res,next)=>{
    const {id} = req.params;
    console.log('del id=',id);
    const checkshipped = await Order.findById(id);
    console.log('order=',checkshipped.orderStatus[0].type)
    if(checkshipped.orderStatus[0].type==='ordered'){
      const deleteorder = await Order.findByIdAndDelete(id);
      return res.redirect('/product/ordercompletion');
    }
    else{
      req.flash('error','Item has already shipped');
      return res.redirect('/product/ordercompletion');
    }  
}

module.exports.showOrdercompletion = async (req, res) => {
  const orderid = req.session.orderid;
  const user = req.session.user;
  const ucode = req.session.code
  const order = await Order.find({ user: user }).populate({
    path: "items",
    populate: { path: "product" }
  }).sort({createdAt:-1});
  const orderquantity = await Order.aggregate([{$match:{user:mongoose.Types.ObjectId(user)}},{$project:{sum:{$sum:'$items.quantity'}}}])

  if(req.session.couponApplied){
    const updateCust = await Coupon.findOneAndUpdate({code:ucode},{$addToSet:{customers:user}},{upsert:true,new:true})
    //const updateCust = await Coupon.findOneAndUpdate({code:ucode},{$pull:{customers:user}})
  }
  // const product = order[0].items[0].product;
  // console.log('itemsnow',product)
  res.render("products/ordercompletion", { order,orderquantity });
}