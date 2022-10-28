const { urlencoded } = require('express');
const express = require('express');
const router = express.Router();
const passport = require('passport');
const Product = require('../model/products');
const session = require('express-session');
const methodOverride = require('method-override');
const multer = require('multer');
const {storage,cloudinary,bannerStorage} = require('../cloudinary/index')
const upload = multer({storage})
const uploadBanner = multer({bannerStorage})
const User = require('../model/user');
const asyncErrorCatcher = require('../utils/asyncErrorCatcher');
const Products = require('../model/products');
const Order = require('../model/order')
const Category = require('../model/category');
const Subcategory = require('../model/subCategory');
const Coupon = require('../model/coupon');

const dashController = require('../controller/admin/dashboardController')
const bannerController = require('../controller/admin/bannerController');
const { date } = require('joi');

router.use(methodOverride('_method'));


const isAdminLogin = (req,res,next)=>{
    const {username,password} = req.body;
    if((username&&username==='admin')&&(password&&password==='123'))
    {
        req.session.isAdmin=true;
        next();
    }
    else
    {
        req.flash('error','incorrect username or password');
        res.redirect('/admin/login')
    }
}
const admin = (req,res,next)=>{
    if(req.session.isAdmin)
    {
        next();
    }
    else
    {
        req.flash('error','Not an admin');
        res.redirect('/admin/login')
    }
}

router.get('/login',(req,res)=>{
    if(req.session.isAdmin){
        return res.redirect('/admin/dashboard')
    }
    res.render('admin/login')
})

router.post('/login',isAdminLogin,(req,res)=>{
    req.flash('success','Welcome Admin');
    res.redirect('/admin/dashboard');

})

router.get('/dashboard',admin,async(req,res,next)=>{
    
    //order of today
    const daystart = new Date();
    daystart.setHours(0,0,0,0);
    const dayend = new Date();
    dayend.setHours(23,59,59,999);

    //order of month
    const date = new Date();
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);

    //order revenue

    const revenue = await Order.aggregate([{$group:{_id:null,sum:{$sum:'$bill'}}}])
    const totalRevenue = revenue[0].sum;
    console.log('rev',revenue)


    const totalOrders = await Order.countDocuments();
    const totalUsers = await User.countDocuments();

    const monthsOrders = await Order.countDocuments({createdAt:{$gte:firstDay,$lt:lastDay}});
   
    const todaysOrders = await Order.countDocuments({createdAt:{$gte:daystart,$lt:dayend}});

    console.log('todays order',todaysOrders);
    const totalProducts = await Product.countDocuments();
    //let totalOrders ;
    let totalReviews;
    res.render('admin/dashboard',{totalUsers,totalProducts,todaysOrders,monthsOrders,totalOrders,totalRevenue});
})

router.get('/dashboard/weeksale',dashController.sendSalesData)

router.get('/dashboard/comparemethod',dashController.sendMethodData)

router.get('/products',admin,async(req,res)=>{
    const products =await Product.find({});
    res.render('admin/products',{products});
})
router.get('/products/new',admin,async(req,res)=>{
    const category = await Category.find({});
    const subcategory = await Subcategory.find({});
    const arrayOfDropdown = await Subcategory.aggregate([{$match:{"subcategory":1,}},{$lookup:{from:'categories',localField:'categoryId',foreignField:'_id',as:'category'}}]);
    res.render('admin/createProduct',{category,subcategory});
})

router.post('/products/new',admin,upload.array('image'),async (req,res,next)=>{
    console.log(req.body,' is the new product');
    const product =  new Product(req.body);
    const productId = product._id;
    product.image = req.files.map(f =>({ url: f.path, filename: f.filename }))
    await product.save();
    const subcategory = await Subcategory.findByIdAndUpdate(productId,{delStatus:'false'})
    req.flash('success','Product Added Succesfully!');
    res.redirect(`/admin/products/${product._id}`);
})

// router.post('/products/new',(req,res)=>{
//     console.log(req.body,req.files)
//     res.send('It worked')
// })

router.get('/products/:id',admin,async(req,res)=>{
   const {id} = req.params;
   const products = await Product.findById(id).populate({path:'subcategory'});
   res.render('admin/showProduct',{products})
   
})
router.delete('/products/:id',admin,async(req,res)=>{
    const {id} = req.params;
    const deletedProduct = await Product.findByIdAndDelete(id);
    console.log(deletedProduct);
    req.flash('success','Product succesfully Deleted');
    res.redirect('/admin/products')
})

router.get('/products/:id/update',admin,async(req,res)=>{
    const {id} = req.params;
    const product = await Product.findById(id);
    res.render('admin/updateProduct',{product})
})
router.put('/products/:id/update',admin,upload.array('image'),async(req,res)=>{
    const {id} = req.params;
    const product= await Product.findByIdAndUpdate(id,{...req.body});
    const images = req.files.map(f =>({ url: f.path, filename: f.filename }));
    console.log(product);
    product.image.push(...images);
    await product.save();
    req.flash('success',' Product Updated Succesfully !')
    res.redirect(`/admin/products/${product._id}`);
})

router.get('/category',admin,async(req,res,next)=>{
    const categories = await Category.find({});
    const count = await Category.countDocuments();
    console.log('req.body =',req.body)
    res.render('admin/createCategory',{categories})
})
router.post('/createcategory',admin,async(req,res,next)=>{
    const {category}= req.body;
    const cat = new Category(req.body)
    await cat.save();
    res.redirect('/admin/category');  
})
router.get('/category/:id',admin,async(req,res,next)=>{
    const {id} = req.params;
    const categories = await Category.findById(id);
    if(categories.delStatus){
        console.log(categories);
        res.render('admin/editCategory',{categories});
    }
    else{
        req.flash('error','This category already in Use');
        res.redirect('/admin/category')
    }
    

})

router.delete('/category/:id',admin,async(req,res,next)=>{
    const {id} = req.params;
    const categories = await Category.findById(id);
    if(categories.delStatus){
        console.log(categories);
        const deleteCategory = await Category.findByIdAndDelete(id);
        console.log(deleteCategory,'has been deleted')
        res.redirect('/admin/category');
    }
    else{
        req.flash('error','This category already in Use');
        res.redirect('/admin/category')
    }
})
router.put('/category/:id',admin,async(req,res,next)=>{
    const {id} = req.params;
    const categories = await Category.findByIdAndUpdate(id,{...req.body});
   
    req.flash('success','Category Updated Sucessfully');
    res.redirect('/admin/category')

})


router.get('/subcategory',admin,async(req,res,next)=>{
    const category = await Category.find();
    const subcategory = await Subcategory.aggregate([{$match:{}},{$lookup:{from:'categories',localField:'categoryId',foreignField:'_id',as:'category'}}]);
    console.log('printing sub cat =',subcategory);
    // for(let i of subcategory){
    //     console.log(i.category[0].category)
    // }
    res.render('admin/createSub',{subcategory,category});
})
router.post('/createsub',admin,async(req,res,next)=>{
    const sub =new Subcategory(req.body);
    await sub.save();
    const catId = sub.categoryId;
    const category = await Category.findByIdAndUpdate(catId,{delStatus:'false'})
    console.log(category)
    console.log('req.body==',req.body);
    res.redirect('/admin/subcategory');
})

router.get('/subcategory/:id',admin,async(req,res,next)=>{
    const {id} = req.params;
    const subcategories = await Subcategory.findById(id);
    console.log('error sub==',subcategories)
    if(subcategories.delStatus){
        console.log(subcategories);
        res.render('admin/editSub',{subcategories});
    }
    else{
        req.flash('error','Can\'t Edit, This subcategory already in Use');
        res.redirect('/admin/subcategory')
    }
    

})
router.put('/subcategory/:id',admin,async(req,res,next)=>{
    const {id} = req.params;
    const subcategories = await Subcategory.findByIdAndUpdate(id,{...req.body});
    console.log('error sub==',subcategories)
    
    req.flash('success','subcategory successfully updated');
    res.redirect('/admin/subcategory')
    
    

})

router.delete('/subcategory/:id',admin,async(req,res,next)=>{
    const {id} = req.params;
    const subcategories = await Subcategory.findById(id);
    if(subcategories.delStatus){
        const deleteCategory = await Subcategory.findByIdAndDelete(id);
        console.log(deleteCategory,'has been deleted')
        res.redirect('/admin/subcategory');
        
    }
    else{
        req.flash('error','Can\'t Delete, This subcategory already in Use');
        res.redirect('/admin/subcategory')
    }
    

})

// /admin/user
router.get('/users',admin,asyncErrorCatcher(async(req,res)=>{
    const users = await User.find({});
    res.render('admin/users',{users})
}))
router.get('/users/:id',admin,async(req,res)=>{
    const {id} = req.params;
    const user = await User.findById(id);
    res.render('admin/showUser',{user})
    
 })
 router.delete('/users/:id',admin,async(req,res)=>{
     const {id} = req.params;
     const deleteUser = await User.findByIdAndDelete(id);
     console.log(deleteUser);
     req.flash('success','User succesfully Deleted');
     res.redirect('/admin/users')
 })
 
 router.get('/users/:id/update',admin,async(req,res)=>{
     const {id} = req.params;
     const user = await User.findById(id);
     res.render('admin/updateUser',{user})
 })
 router.put('/users/:id/update',admin,async(req,res)=>{
     const {id} = req.params;
     const user= await User.findByIdAndUpdate(id,{...req.body});
     req.flash('success',' User Updated Succesfully !')
     res.redirect(`/admin/users/${user._id}`);
 })

 router.get('/order',admin,async(req,res,next)=>{
    const orders = await Order.find({}).populate('user')
    res.render('admin/orderlist',{orders});
 })
 router.get('/order/:id',admin,async(req,res,next)=>{
    const {id} = req.params;
    const order = await Order.findById(id).populate('user address').populate({path:'items.product'});
    const orderstatus = ['ordered','packed','shipped','delivered','cancelled']
    const stat = order.orderStatus[0].type;
    const index = orderstatus.indexOf(stat);
    const ddate = order.expecteddate;
    console.log('index=',index)
    console.log('stat',stat)
    console.log('order==',order)
    res.render('admin/editOrder',{order,orderstatus,index,ddate});
 })

 router.put('/order/:id',admin,async(req,res,next)=>{
    const {id} = req.params;
    const {orderstatus,expecteddate}=req.body;
    const date = new Date(expecteddate)
    if(expecteddate.length===0){

        const updateorder = await Order.findByIdAndUpdate(id,{$set:{orderStatus:{type:orderstatus,date:new Date(),isCompleted:false}}})
        return res.redirect('back');
    }
    else{

        console.log('dat=',expecteddate);
        console.log(date);
        const updateorder = await Order.findByIdAndUpdate(id,{$set:{expecteddate:date,orderStatus:{type:orderstatus,date:new Date(),isCompleted:false}}})
        //await updateorder.orderStatus.push({type:orderstatus,date:new Date(),isCompleted:false})
        console.log('updateorder==',updateorder);
        res.redirect('back');
    }


 })

 //coupon

router.get('/coupon',async(req,res,next)=>{
    const coupons = await Coupon.find({});
    res.render('admin/coupon',{coupons});
})
router.get('/coupon/new',async(req,res)=>{
    res.render('admin/createCoupon');
})
router.post('/coupon/new',async(req,res,next)=>{
    console.log('coupon',req.body);

    const newCoupon = new Coupon(req.body)
    newCoupon.save();
    res.send('done')

})
router.delete('/coupon/:id',async(req,res,nex)=>{
    const {id} = req.params;
    const deleteItem = await Coupon.findByIdAndDelete(id);
    req.flash('success','coupon Deleted Succesfully')
    res.redirect('/admin/coupon')
})

router.get('/banner',bannerController.showBanner)

router.get('/banner/new',bannerController.showBannerForm)
router.post('/banner/new',upload.array('image'),bannerController.addBanner)

router.get('/banner/:id',bannerController.showSingleBanner)

router.delete('/banner/:id',bannerController.deleteBanner);
router.get('/banner/:id/update',bannerController.updateBannerPage);
router.put('/banner/:id/update',bannerController.updateBanner);

router.get('/logout',admin,(req,res)=>{
    req.flash('success','logged out')
    delete req.session.isAdmin;
    res.redirect('/admin/login')
})
module.exports=router;