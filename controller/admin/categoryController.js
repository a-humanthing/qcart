const Category = require('../../model/category');

module.exports.showAllCategories = async(req,res,next)=>{
    const categories = await Category.find({});
    res.render('admin/createCategory',{categories})
}

module.exports.createCategory = async(req,res,next)=>{
    const {category}= req.body;
    const cat = new Category(req.body)
    await cat.save();
    res.redirect('/admin/category');  
}

module.exports.showSingleCategory = async(req,res,next)=>{
    const {id} = req.params;
    const categories = await Category.findById(id);
    if(categories.delStatus){
        console.log(categories);
        res.render('admin/editCategory',{categories});
    }
    else{
        req.flash('error','This category has been deleted');
        res.redirect('/admin/category')
    }
}

module.exports.deleteCategory = async(req,res,next)=>{
    const {id} = req.params;
    const categories = await Category.findById(id);
    if(categories.delStatus){
        console.log(categories);
        const deleteCategory = await Category.findByIdAndDelete(id);
        console.log(deleteCategory,'has been deleted')
        res.redirect('/admin/category');
    }
    else{
        req.flash('error','This category already in Use');
        res.redirect('/admin/category')
    }
}

module.exports.updateCategory = async(req,res,next)=>{
    const {id} = req.params;
    const categories = await Category.findByIdAndUpdate(id,{...req.body});
   
    req.flash('success','Category Updated Sucessfully');
    res.redirect('/admin/category')

}