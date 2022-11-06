const Product = require('../../model/products');
const Category = require('../../model/category');

module.exports.baseLoad = async(req,res,next)=>{
    const {cat}=req.body;
    const baseLoad = await Product.find({category:cat}).limit(3);
    console.log('reached',baseLoad)
    res.json({ baseLoad });
}
module.exports.priceLH=async(req,res,next)=>{
    const {cat}=req.body;
    console.log('id',cat)
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