const Subcategory = require('../../model/subCategory');
const Category = require('../../model/category');

module.exports.showAllSubcat = async(req,res,next)=>{
    const category = await Category.find({isDeleted:false});
    const subcategory = await Subcategory.aggregate([{$match:{}},{$lookup:{from:'categories',localField:'categoryId',foreignField:'_id',as:'category'}}]);
    console.log('sub=',subcategory);
    res.render('admin/createSub',{subcategory,category});
}

module.exports.createSubcat = async(req,res,next)=>{
    const sub =new Subcategory(req.body);
    await sub.save();
    const catId = sub.categoryId;
    const category = await Category.findByIdAndUpdate(catId,{delStatus:'false'})
    res.redirect('/admin/subcategory');
}

module.exports.showSingleSubcat = async(req,res,next)=>{
    const {id} = req.params;
    const subcategories = await Subcategory.findById(id);
    if(subcategories.delStatus){
        res.render('admin/editSub',{subcategories});
    }
    else{
        req.flash('error','Can\'t Edit, This subcategory already in Use');
        res.redirect('/admin/subcategory')
    }
}

module.exports.updateSubcat = async(req,res,next)=>{
    const {id} = req.params;
    const subcategories = await Subcategory.findByIdAndUpdate(id,{...req.body});
    req.flash('success','subcategory successfully updated');
    res.redirect('/admin/subcategory')
}

module.exports.deleteSubcat = async(req,res,next)=>{
    const {id} = req.params;
    const subcategories = await Subcategory.findById(id);
    console.log('id=',id);
    console.log('subcategory=',subcategories)
    if(subcategories.delStatus){
        const deleteCategory = await Subcategory.findByIdAndUpdate({_id:id},{isDeleted:true});
        res.redirect('/admin/subcategory');
        
    }
    else{
        req.flash('error','Can\'t Delete, This subcategory already in Use');
        res.redirect('/admin/subcategory')
    }
}

