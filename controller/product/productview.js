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
      const array =product.reviews;
      let totalstars = 0;
      for(let a of array){
        totalstars+=a.rating
      }
      const totalReviews = array.length;
      let avgStar
      if(totalReviews===0){
        avgStar=0;
      }
      else{
         avgStar =Math.round(totalstars/totalReviews*10)/10;
      }
      console.log('star',avgStar);


      console.log('t',avgStar)
    console.log('p',product)
    const allProducts = await Product.find({});
    res.render("products/show", { product, userId, allProducts,totalReviews,avgStar });
}