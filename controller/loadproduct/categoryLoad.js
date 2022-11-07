const Product = require('../../model/products');
const Category = require('../../model/category');
const Subcategory = require('../../model/subCategory');

module.exports.baseLoad = async(req,res,next)=>{
    const {cat}=req.body;
    const baseLoad = await Product.find({category:cat}).limit(3);
    res.json({ baseLoad });
}
module.exports.priceLH=async(req,res,next)=>{
    const {cat}=req.body;
    const lToH = await Product.find({ category:cat}).sort({
        price: 1,
      });
    res.json({lToH})
}
module.exports.priceHL = async(req,res,next)=>{
    const {cat}=req.body;
    const hToL = await Product.find({ category:cat}).sort({
        price: -1,
      });
      res.json({hToL});
}
module.exports.latest= async(req,res,next)=>{
    const {cat} = req.body;
    const latest = await Product.find({category:cat}).sort({
        createdAt:-1
    });
    res.json({latest});
}
module.exports.updateByCheck = async(req,res,next)=>{
    const {subid} = req.body;
    const updatedProducts = await Product.find({subcategory:subid});
    res.json({updatedProducts});
}
module.exports.searchProduct = async(req,res,next)=>{
    const {keyword}=req.body;
    console.log('key',keyword)
    const matchedProduct = await Product.find({productname:new RegExp(keyword,'i')}).limit(3);
    let id;
    let notFound=false;
    if(matchedProduct===null){
        notFound=true
    }
    else{
        console.log('match',matchedProduct);
        id= matchedProduct._id;
    }
    res.json({matchedProduct,id,notFound});
}