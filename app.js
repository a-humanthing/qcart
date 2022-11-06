if(process.env.NODE_ENV !=="production"){
    require('dotenv').config();
}
const express = require('express');
const app = express();
const path = require('path')
const ejsMate = require('ejs-mate');
const mongoSanitize = require('express-mongo-sanitize');
const adminRoutes = require('./routes/admin')
const User = require('./model/user')
const Admin = require('./model/admin')
const passport = require('passport');
const LocalStrategy = require('passport-local');
const flash = require('connect-flash');
const session = require('express-session');
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo')
const userRoutes = require('./routes/user');
const productRoutes = require('./routes/products');
const loadRoutes = require('./routes/loadproduct');
const ExpressError = require('./utils/ExpressError');
const Subcategory = require('./model/subCategory');
const Cart = require('./model/cart')
const Category = require('./model/category');
const Razorpay = require('razorpay')

const dbUrl = process.env.DB_URL
//'mongodb://0.0.0.0:27017/qcart'
mongoose.connect('mongodb://0.0.0.0:27017/qcart');

const db = mongoose.connection;
db.on('error',console.error.bind(console,"connection error"));
db.once('open',()=>{
    console.log('Database connected')
})
app.use(express.static(path.join(__dirname,'public')))

// passport.serializeUser(User.serializeUser());
// passport.deserializeUser(User.deserializeUser());


const sessionConfig = {
    secret:'qcartsecret',
    resave:false,
    saveUninitialized:true,
    store: MongoStore.create({mongoUrl:'mongodb://0.0.0.0:27017/qcart'}),
    cookie:{
        httpOnly:true,
        expires:Date.now()+1000*60*60*24*7,
        maxAge:1000*60*60*24*7
    }
}



app.engine('ejs',ejsMate);

app.set('view engine', 'ejs')
app.set('views',path.join(__dirname,'views'))




app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(mongoSanitize());


app.use(session(sessionConfig));
app.use(flash());

// app.use(passport.initialize());
// app.use(passport.session());
// passport.use(new LocalStrategy(User.authenticate()))




app.use(async(req,res,next)=>{
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.adminAvailable=req.session.isAdmin;
    res.locals.currentUser = req.user||req.session.otpVerified;
    res.locals.userAliveId=req.session.user;
    res.locals.cartcount=req.session.cartcount;
    //if error then this should comment
    //res.locals.UserId = req.user.username;
    const cartFull = await Cart.findOne({ user: req.session.user }).populate({
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

    next();
})

app.use(function (req, res, next) {
    res.set(
      "Cache-Control",
      "no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0"
    );
    next();
  });


  app.use('/admin',adminRoutes);
  app.use('/user',userRoutes);
  app.use('/product',productRoutes);
  app.use('/loadproduct',loadRoutes)





app.get('/',(req,res)=>{
    
    res.redirect('/user/home');
})


app.post('/loadsubcategory',async(req,res,next)=>{
    const {categoryId} = req.body;
    console.log('category==',categoryId);
    const cat = await Category.findOne({category:categoryId})
    console.log('cat==',cat)
    const id = cat._id;
    const subcategories = await Subcategory.find({categoryId:id});
    console.log('data==',subcategories);
    res.send({subcategories});
})

app.all('*',(req,res,next)=>{
    // res.status(404).send("Not found");
    next(new ExpressError('page not Found',404));
})

app.use((err,req,res,next)=>{
    const {status=500}=err;
    // console.log(err);
    if(!err.message) err.message="Ooops!"
    res.status(status).render('error',{err})
    // res.status(status).send(message);
    
})


app.listen(7000,(req,res)=>{
    console.log(`http://localhost:${process.env.PORT}`)
})