const Product = require("../../model/products");
const User = require('../../model/user');

module.exports.showAllUsers = async(req,res)=>{
    const users = await User.find({});
    res.render('admin/users',{users})
}

module.exports.showSingleUser = async(req,res)=>{
    const {id} = req.params;
    const user = await User.findById(id);
    res.render('admin/showUser',{user})
 }

module.exports.deleteUser = async(req,res)=>{
    const {id} = req.params;
    const deleteUser = await User.findByIdAndDelete(id);
    req.flash('success','User succesfully Deleted');
    res.redirect('/admin/users')
}

module.exports.renderUserUpdateForm = async(req,res)=>{
    const {id} = req.params;
    const user = await User.findById(id);
    res.render('admin/updateUser',{user})
}

module.exports.updateUser = async(req,res)=>{
    const {id} = req.params;
    const user= await User.findByIdAndUpdate(id,{...req.body});
    req.flash('success',' User Updated Succesfully !')
    res.redirect(`/admin/users/${user._id}`);
}