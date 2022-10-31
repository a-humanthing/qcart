const { default: mongoose } = require('mongoose');
const Product = require('../../model/products');

module.exports.showProduct = async (req, res) => {
    const { id } = req.params;
    const userId = req.session.user;
    res.locals.userid = mongoose.Types.ObjectId(req.session.user) ;
    const product = await Product.findById(id).populate({
      path:'reviews',
      populate:{
          path:'author'
      }});
      const totalrating = await Product.aggregate([{$match:{_id:id}}])
      console.log('t',totalrating)
    console.log('p',product)
    const allProducts = await Product.find({});
    res.render("products/show", { product, userId, allProducts });
  }