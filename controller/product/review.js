const Product = require('../../model/products');
const Review = require('../../model/review');

module.exports.renderReviewForm = async(req,res,nex)=>{
    const {proid} = req.params;
    const product = await Product.findById(proid);
   // console.log(product);
    res.render('products/addReviews',{product});
}

module.exports.postReview = async(req,res,next)=>{
    const {proid} =req.params;
    const userid = req.session.user;
    const review = new Review(req.body);
    review.author=userid
    review.save();
    const addReview = await Product.findById(proid);
    addReview.reviews.push(review._id)
    await addReview.save();
    console.log('rev',addReview);
    res.redirect(`/product/${proid}/review`);
}

module.exports.deleteReview = async (req,res,next)=>{
    const { proid, revid } = req.params;
    await Product.findByIdAndUpdate(proid,{ $pull:{reviews: revid}});
    await Review.findByIdAndDelete(revid);
    req.flash('success','Review Deleted Successfully !')
    res.redirect(`/product/${proid}`);
}