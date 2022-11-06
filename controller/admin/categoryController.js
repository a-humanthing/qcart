const Category = require('../../model/category');

module.exports.showAllCategories = async(req,res,next)=>{
    const categories = await Category.find({});
    res.render('admin/createCategory',{categories})
}

module.exports.createCategory = async(req,res,next)=>{
    const {category}= req.body;
    console.log('body',req.body);
    console.log('file',req.file.path)
    const image = {url:req.file.path,filename:req.file.filename}
    const cat = new Category({category:category,image:image});
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
        const deleteCategory = await Category.findByIdAndUpdate({_id:id},{isDeleted:true});
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