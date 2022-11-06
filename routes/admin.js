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
const productController = require('../controller/admin/productController');
const categoryController = require('../controller/admin/categoryController');
const subcatController = require('../controller/admin/subcatController');
const userController = require('../controller/admin/userController');
const couponController = require('../controller/admin/couponController');
const orderControlller = require('../controller/admin/orderController');
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

router.get('/dashboard',admin,dashController.showDashboard)

router.get('/dashboard/weeksale',dashController.sendSalesData)

router.get('/dashboard/comparemethod',dashController.sendMethodData)

router.get('/products',admin,productController.showAllProducts);

router.get('/products/new',admin,productController.renderAddProductForm)

router.post('/products/new',admin,upload.array('image'),productController.addProduct)

router.get('/products/:id',admin,productController.showSingleProduct)
router.delete('/products/:id',admin, productController.deleteProduct)

router.get('/products/:id/update',admin,productController.renderUpdateForm)
router.put('/products/:id/update',admin,upload.array('image'),productController.updateProduct)

router.get('/category',admin,categoryController.showAllCategories)
router.post('/createcategory',admin,upload.single('image'),categoryController.createCategory)
router.get('/category/:id',admin, categoryController.showSingleCategory)

router.delete('/category/:id',admin,categoryController.deleteCategory)

router.put('/category/:id',admin,categoryController.updateCategory)


router.get('/subcategory',admin,subcatController.showAllSubcat)
router.post('/createsub',admin,subcatController.createSubcat)

router.get('/subcategory/:id',admin,subcatController.showSingleSubcat)
router.put('/subcategory/:id',admin,subcatController.updateSubcat)

router.delete('/subcategory/:id',admin,subcatController.deleteSubcat)

// /admin/user
router.get('/users',admin,asyncErrorCatcher(userController.showAllUsers))
router.get('/users/:id',admin,userController.showSingleUser)
router.delete('/users/:id',admin,userController.deleteUser)
 
 router.get('/users/:id/update',admin,userController.renderUserUpdateForm)
 router.put('/users/:id/update',admin,userController.updateUser)

 router.get('/order',admin,orderControlller.showAllOrders)
 router.get('/order/:id',admin,orderControlller.showSingleOrder)

 router.put('/order/:id',admin,orderControlller.updateOrder)

 //coupon

router.get('/coupon',couponController.showAllCoupons)

router.get('/coupon/new',admin,couponController.renderForm)
router.post('/coupon/new',admin,couponController.addCoupon)
router.delete('/coupon/:id',admin,couponController.deleteCoupon)

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