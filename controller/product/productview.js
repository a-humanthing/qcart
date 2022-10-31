const Product = require('../../model/products');

module.exports.showProduct = async (req, res) => {
    const { id } = req.params;
    const userId = req.session.user;
    const product = await Product.findById(id);
    const allProducts = await Product.find({});
    res.render("products/show", { product, userId, allProducts });
  }