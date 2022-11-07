
const Product = require('../../model/products');
const Category = require('../../model/category');
const Subcategory = require('../../model/subCategory');

module.exports.showAllProducts = async(req,res)=>{
    const products =await Product.find({});
    res.render('admin/products',{products});
}

module.exports.renderAddProductForm = async(req,res)=>{
    const category = await Category.find({});
    const subcategory = await Subcategory.find({isDeleted:false});
    const arrayOfDropdown = await Subcategory.aggregate([{$match:{"subcategory":1}},{$lookup:{from:'categories',localField:'categoryId',foreignField:'_id',as:'category'}}]);
    console.log('arraydrop=',subcategory);
    res.render('admin/createProduct',{category,subcategory});
}

module.exports.addProduct = async (req,res,next)=>{
    console.log(req.body,' is the new product');
    const product =  new Product(req.body);
    const productId = product._id;
    product.image = req.files.map(f =>({ url: f.path, filename: f.filename }))
    await product.save();
    const subcategory = await Subcategory.findByIdAndUpdate({_id:productId},{delStatus:'false'},{$inc:{"availableProduct":1}});
    console.log('subcount',subcategory);
    req.flash('success','Product Added Succesfully!');
    res.redirect(`/admin/products/${product._id}`);
}

module.exports.showSingleProduct = async(req,res)=>{
    const {id} = req.params;
    const products = await Product.findById(id).populate({path:'subcategory'});
    res.render('admin/showProduct',{products})
 }

 module.exports.deleteProduct = async(req,res)=>{
    const {id} = req.params;
    const deletedProduct = await Product.findByIdAndDelete(id);
    const subcategory = await Subcategory.findByIdAndUpdate({productId:id},{delStatus:'false'},{$inc:{availableProduct:1}})
    console.log(deletedProduct);
    req.flash('success','Product succesfully Deleted');
    res.redirect('/admin/products')
}

module.exports.renderUpdateForm = async(req,res)=>{
    const {id} = req.params;
    const category = await Category.find({});
    const subcategory = await Subcategory.find({isDeleted:false});
    const product = await Product.findById(id);
    res.render('admin/updateProduct',{product,category,subcategory})
}

module.exports.updateProduct = async(req,res,next)=>{
    const {id} = req.params;
    const product= await Product.findByIdAndUpdate(id,{...req.body});
    //const images = req.files.map(f =>({ url: f.path, filename: f.filename }));
    console.log('cas',product);
    //product.image.push(...images);
    await product.save();
    req.flash('success',' Product Updated Succesfully !')
    res.redirect(`/admin/products/${product._id}`);
}