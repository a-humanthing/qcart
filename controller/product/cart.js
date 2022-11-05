const Cart = require("../../model/cart");
const Product = require("../../model/products");
const mongoose = require('mongoose');
const session = require('express-session');

module.exports.viewCart = async (req, res, next) => {
  const id = req.session.user;
  req.session.discountAmount = false;
  req.session.discountTotal = false;
  req.session.couponApplied = false;
  res.locals.userid = req.session.user;
  try {
    res.locals.couponApplied = req.session.couponApplied;
    const cartFull = await Cart.findOne({ user: id }).populate({
      path: "user",
      path: "cartItem",
      populate: { path: "product" },
    });
    const cart = cartFull.cartItem;
    res.locals.cartcount = cart.length;
    const totalAmount = cartFull.bill;
    res.render("products/cart", { cart, cartFull, totalAmount });
  } catch (error) {
    next(error);
  }
};

module.exports.addToCart =  async (req, res, next) => {
    const { id } = req.params;
    res.locals.userid = req.session.user;
    const user = req.session.user;
    let billcart;
    try {
      let cart = await Cart.findOne({ user });
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
        if (itemIndex > -1) {
          const productItem = cart.cartItem[itemIndex];
          productItem.quantity = productItem.quantity + 1;
          cart.bill = cart.cartItem.reduce((acc, curr) => {
            return acc + curr.quantity * curr.price;
          }, 0);
          billcart=cart.bill;
          cart.cartItem[itemIndex] = productItem;
          await cart.save();
          //req.flash('success','Item Quantity increased in Cart')
          return res.json({qty:true,bill:billcart});
        } else {
          await cart.cartItem.push({ product, quantity, price });
          cart.bill = await cart.cartItem.reduce((acc, curr) => {
            return acc + curr.quantity * curr.price;
          }, 0);
        }
        cart = await cart.save();
        billcart=cart.bill;
        //req.flash('success','Item has been added to Cart')
        return res.json({qty:false,cart:billcart});
      } else {
        const newCart = await Cart.create({
          user: user,
          products: [{ product, quantity, price }],
          bill: quantity * price,
        });
        //req.flash('success','Item has been added to Cart')
        billcart=cart.bill;
        return res.json({qty:false,bill:billcart});
      }
    } catch (error) {
      console.log(error);
      next(error)
    }
  }

module.exports.reduceQty = async (req, res, next) => {
    let { proid } = req.body;
    let user1 = req.session.user;
    user1 = mongoose.Types.ObjectId(user1);
    const reduceqty = await Cart.findOneAndUpdate(
      {
        $and: [
          {
            user: user1,
          },
          {
            "cartItem.product": proid,
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
   
    console.log("reduce qty--", reduceqty);
    let cart = await Cart.findOne({ user: user1 });
    console.log("cart===", cart);
  
    const itemIndex = cart.cartItem.findIndex((item) => item.product == proid);
    console.log("index==", itemIndex);
    let item = cart.cartItem[itemIndex];
    let itemqty;
    let itembill;
    console.log('item=',item);
    if (item.quantity < 1) {
      cart.cartItem.splice(itemIndex, 1);
      cart.bill = cart.cartItem.reduce((acc, curr) => {
        return acc + curr.quantity * curr.price;
      }, 0);
      itembill=cart.bill;
      cart = await cart.save();
    } else {
      cart.bill -= item.quantity * item.price;
      if (cart.bill < 0) {
        cart.bill = 0;
      }
      cart.bill = cart.cartItem.reduce((acc, curr) => {
        return acc + curr.quantity * curr.price;
      }, 0);
      itembill=cart.bill;
      cart = await cart.save();
    }
    console.log("rdcqty==", reduceqty);
    res.json({success:true,itembill})
  }

  module.exports.removeFromCart = async (req, res, next) => {
    const user = req.session.user;
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
  }

  module.exports.removeAsynCart = async(req,res,next)=>{
    const user = req.session.user;
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
        return res.json({success:true});
      } else {
        res.status(404).send("item not found");
      }
    } catch (error) {
      console.log(error);
      res.status(400).send();
    }
  }