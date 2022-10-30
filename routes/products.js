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
router.use(methodOverride("_method"));

router.get("/cart", isLoggedIn, async (req, res, next) => {
  const id = req.user._id;
  req.session.discountAmount=false;
  req.session.discountTotal=false;
  req.session.couponApplied=false;
  res.locals.userid = req.session.user;
  try {
    res.locals.couponApplied=  req.session.couponApplied
    const cartFull = await Cart.findOne({ user: id }).populate({
      path: "user",
      path: "cartItem",
      populate: { path: "product" },
    });
    const cart = cartFull.cartItem;
    res.locals.cartcount = cart.length;
    const totalAmount = cartFull.bill;
    // console.log(cartFull);
    // console.log('cart number=',cart.length);
    res.render("products/cart", { cart, cartFull,totalAmount });
  } catch (error) {
    next(error);
  }
});

router.get("/cart/:id", isLoggedIn, async (req, res, next) => {
  const id = req.user._id;
  res.locals.userid = req.session.user;
  try {
    res.locals.couponApplied=  req.session.couponApplied
    const cartFull = await Cart.findOne({ user: id }).populate({
      path: "user",
      path: "cartItem",
      populate: { path: "product" },
    });
    const cart = cartFull.cartItem;
    const totalAmount = cartFull.bill;
    req.session.cartcount = cart.length;
    // console.log(cartFull);
    // console.log('cart==',cart);
    // console.log('cartfull--',cartFull)
    res.render("products/cart", { cart, cartFull,totalAmount });
  } catch (error) {
    next(error);
  }
});

//add cart
router.post("/cart/:id", isLoggedIn, async (req, res, next) => {
  const { id } = req.params;
  res.locals.userid = req.session.user;

  //userId may be changed to user
  const user = req.user._id;
  try {
    let cart = await Cart.findOne({ user });
    // console.log("cart===", cart);
    const pro = await Product.findById(id);
    if (!pro) {
      res.status(404).send({ message: "item not found" });
      return;
    }
    const product = pro._id;
    const price = pro.price;
    const quantity = 1;
    if (cart) {
      let itemIndex = await cart.cartItem.findIndex((p) => p.product == id);
      //check if product exists or not
      if (itemIndex > -1) {
        const productItem = cart.cartItem[itemIndex];
        productItem.quantity = productItem.quantity + 1;
        cart.bill = cart.cartItem.reduce((acc, curr) => {
          return acc + curr.quantity * curr.price;
        }, 0);
        cart.cartItem[itemIndex] = productItem;
        await cart.save();
        req.flash('success','Item Quantity increased in Cart')
        return res.redirect("back");
      } else {
        await cart.cartItem.push({ product, quantity, price });
        cart.bill = await cart.cartItem.reduce((acc, curr) => {
          return acc + curr.quantity * curr.price;
        }, 0);
      }
      cart = await cart.save();
      // console.log(cart);
      req.flash('success','Item has been added to Cart')
      return res.redirect("back");
      // return res.status(201).send(cart)
    } else {
      const newCart = await Cart.create({
        user: user,
        products: [{ product, quantity, price }],
        bill: quantity * price,
      });
      // console.log(newCart);
      req.flash('success','Item has been added to Cart')
      return res.redirect("back");
      // return res.status(201).send(newCart);
    }
  } catch (error) {
    console.log(error);
    next(error)
  }
});
//remove from cart
router.post("/reduceqty", async (req, res, next) => {
  let { proid } = req.body;
  let user1 = req.session.user;
  //proid = mongoose.Types.ObjectId(proid);
  user1 = mongoose.Types.ObjectId(user1);
  console.log(user1);
  const reduceqty = await Cart.findOneAndUpdate(
    {
      $and: [
        {
          user: user1,
        },
        {
          "cartItem._id": proid,
        },
      ],
    },
    {
      $inc: {
        "cartItem.$.quantity": -1,
      },
    }
  );

  // updating bill after reducing
 
  console.log("=====proid=", proid);
  let cart = await Cart.findOne({ user: user1 });
  console.log("cart===", cart);

  const itemIndex = cart.cartItem.findIndex((item) => item._id == proid);
  console.log("index==", itemIndex);
  let item = cart.cartItem[itemIndex];
  if (item.quantity < 1) {
    cart.cartItem.splice(itemIndex, 1);
    cart.bill = cart.cartItem.reduce((acc, curr) => {
      return acc + curr.quantity * curr.price;
    }, 0);
    cart = await cart.save();
  } else {
    cart.bill -= item.quantity * item.price;
    if (cart.bill < 0) {
      cart.bill = 0;
    }
    cart.bill = cart.cartItem.reduce((acc, curr) => {
      return acc + curr.quantity * curr.price;
    }, 0);
    cart = await cart.save();
  }
  console.log("rdcqty==", reduceqty);
  res.json({success:true})
  //res.redirect("/product/checkout");
});
router.delete("/cart/:id", isLoggedIn, async (req, res, next) => {
  const user = req.user._id;
  const { id } = req.params;
  try {
    let cart = await Cart.findOne({ user });
    console.log("cart===", cart);
    const itemIndex = cart.cartItem.findIndex((item) => item.product == id);
    console.log("index===", itemIndex);
    if (itemIndex > -1) {
      let item = cart.cartItem[itemIndex];
      cart.bill -= item.quantity * item.price;
      if (cart.bill < 0) {
        cart.bill = 0;
      }
      cart.cartItem.splice(itemIndex, 1);
      cart.bill = cart.cartItem.reduce((acc, curr) => {
        return acc + curr.quantity * curr.price;
      }, 0);
      cart = await cart.save();
      return res.redirect("/product/cart");
    } else {
      res.status(404).send("item not found");
    }
  } catch (error) {
    console.log(error);
    res.status(400).send();
  }
});
//wishlist
router.get("/wishlist", isLoggedIn, async (req, res, next) => {
  const id = req.user._id;
  try {
    const wishList = await Wishlist.findOne({ user: id })
      .populate({
        path: "user",
      })
      .populate("product");
    //should add something to handle if wishlist is empty
    const checkNull = await Wishlist.findOne({ product: null });
    if (checkNull) {
      return res.send("Wish list empty");
    } else {
      const wish = wishList.product;
      console.log("wishlist populated =", wishList);
      return res.render("products/wishlist", { wish, wishList });
    }
  } catch (error) {
    next(error);
  }
});
router.post("/wishlist/:proid", isLoggedIn, async (req, res, next) => {
  const { proid } = req.params;
  const user = req.user._id;
  let wishlistExist = await Wishlist.findOne({ user });
  if (wishlistExist) {
    //console.log('product exists==',wishlistExist.product.includes(proid));
    if (wishlistExist.product.includes(proid)) {
      //console.log('product exists2==',wishlistExist.product.includes(proid));
      req.flash("error", "product already added to wishlist");
      return res.redirect("back");
    } else {
      await wishlistExist.product.push(proid);
      wishlistExist = await wishlistExist.save();
      // console.log(wishlistExist);
      return res.redirect("back");
    }
  } else {
    const wishList = new Wishlist({ user: user, product: proid });
    await wishList.save();
    res.redirect("back");
  }
});
router.delete("/wishlist/:proid", isLoggedIn, async (req, res, next) => {
  const { proid } = req.params;
  const user = req.user._id;
  try {
    let wishList = await Wishlist.findOne({ user });
    const itemIndex = wishList.product.indexOf(proid);
    console.log("itemIndex=", itemIndex);
    if (itemIndex > -1) {
      wishList.product.splice(itemIndex, 1);
      await wishList.save();
      return res.redirect("/product/wishlist");
    }
  } catch (e) {
    next(e);
  }
});

router.post("/offerprice", async (req, res) => {
  console.log('offerprice=',req.body);
  const {offerPrice}=req.body;
  res.json({success:true});
});

router.get("/checkout", isLoggedIn, async (req, res, next) => {
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
  const address = useraddress.address;
  // console.log(useraddress)
  res.render("products/checkout", {
    totalPrice,
    quantity,
    address,
    total
  });
});
router.post("/checkout", isLoggedIn, async (req, res, next) => {
  const user = req.session.user;
  const { id,offerPrice } = req.body;
  console.log(id)
  //console.log(offerPrice)
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
  //res.redirect(`/product/checkout/${id}`);
 
});
router.get('/checkout/:id',async(req,res,next)=>{
  const {id} = req.params;
  const user = req.session.user;
  const checkid = req.session.checkoutid;
  req.session.checkoutType = "single";
  res.locals.checkoutType = req.session.checkoutType;
  res.locals.couponApplied=  req.session.couponApplied
  //let offerPrice;
  let total;
  const checkout = await Checkout.find({_id:checkid}).populate({path: "items",
  populate: { path: "product" }});
  console.log('checkout==-',checkout);
  const useraddress = await Useraddress.findOne({ user }).populate("address");
  const address = useraddress.address;
  console.log('itemsss=',checkout[0].items.length)
  res.locals.username = req.session.username;

  const quantity =1;
  const totalPrice = checkout[0].items[0].price;
  //offerPrice = checkout[0].items[0].discountPrize;
  //if(typeof offerPrice ==='undefined'){
    // offerPrice=0
     //console.log('offprice',offerPrice);
      total = totalPrice ;
  // }else{

  //   offerPrice = checkout[0].items[0].discountPrize;
  //   console.log('offprice',offerPrice);
  //   total = offerPrice + deliveryCharge + packagingCharge;
  // }
 

  res.render("products/checkout", {
    totalPrice,
    quantity,
    total,
    address,
    //offerPrice
  });
})
router.post("/selectaddress", async (req, res, next) => {
  const { selectaddress } = req.body;
  const user = req.session.user;
  const id = req.session.checkoutid;
  res.locals.username = req.session.username;
  req.session.deliveryaddress = selectaddress;
  const addresscheckout = await Checkout.findByIdAndUpdate(id, {
    address: selectaddress,
  });
  res.redirect("/product/ordersummary");
});

router.get("/ordersummary", async (req, res, next) => {
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
});

router.get("/payment", async (req, res) => {
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
});

router.post("/order", async (req, res) => {
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
  // offerPrice = checkout.items[0].discountPrize;
  //   if(typeof offerPrice ==='undefined'){
  //      offerPrice=0
  //      console.log('offprice',offerPrice);
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
});

router.post('/verifypayment',async(req,res,next)=>{
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
})

router.post('/onlinepay',async(req,res,next)=>{

  
  const online = 'online';
  res.send({online})
})

router.get("/ordercompletion", async (req, res) => {
  const orderid = req.session.orderid;
  const user = req.session.user;
  const ucode = req.session.code
  const order = await Order.find({ user: user }).populate({
    path: "items",
    populate: { path: "product" },
  }).sort({createdAt:-1});
  const orderquantity = await Order.aggregate([{$match:{user:mongoose.Types.ObjectId(user)}},{$project:{sum:{$sum:'$items.quantity'}}}])

  if(req.session.couponApplied){
    const updateCust = await Coupon.findOneAndUpdate({code:ucode},{$addToSet:{customers:user}},{upsert:true,new:true})
    //const updateCust = await Coupon.findOneAndUpdate({code:ucode},{$pull:{customers:user}})
  }
  const product = order.items;
  
  res.render("products/ordercompletion", { order,orderquantity });
});

router.post('/coupon',async(req,res,next)=>{
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
})
router.post('/setdiscount',couponController.setDiscount);
router.post('/applycoupon',couponController.applyCoupon)


router.delete('/order/:id',async(req,res,next)=>{
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
})

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const userId = req.session.user;
  const product = await Product.findById(id);
  const allProducts = await Product.find({});
  res.render("products/show", { product, userId, allProducts });
});

module.exports = router;
