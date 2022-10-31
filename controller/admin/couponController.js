const Coupon = require('../../model/coupon');

module.exports.showAllCoupons = async(req,res,next)=>{
    const coupons = await Coupon.find({});
    res.render('admin/coupon',{coupons});
}

module.exports.renderForm = async(req,res)=>{
    res.render('admin/createCoupon');
}

module.exports.addCoupon = async(req,res,next)=>{
    const newCoupon = new Coupon(req.body)
    newCoupon.save();
    res.redirect('/admin/coupon');
}

module.exports.deleteCoupon = async(req,res,nex)=>{
    const {id} = req.params;
    const deleteItem = await Coupon.findByIdAndDelete(id);
    req.flash('success','coupon Deleted Succesfully')
    res.redirect('/admin/coupon')
}

