const Useraddress = require('../../model/userAddress');
const Address = require('../../model/address');
const User = require('../../model/user');
const session =require('express-session');

module.exports.showAllAddress = async (req, res) => {
    res.locals.UserId = req.session.username;
    const id = req.session.user;
    let useraddress = await Useraddress.findOne({user:id});
    if(useraddress){
      const address1 = await Useraddress.findOne({user:id}).populate('address');
      const address = address1.address;
      return res.render('users/address',{address});
    }else{
      res.redirect('/user/new/address')
    }  
  }

  module.exports.renderAddressForm = async(req,res)=>{
    res.locals.UserId = req.session.username||'anonymous';
    res.render('users/addressForm');
}

module.exports.addAddress = async(req,res,next)=>{
    const id = req.session.user;
    let addressExist = await Useraddress.findOne({user:id});
    const address = new Address(req.body);
    await address.save();
    if(addressExist){
      const addressId = address._id;
      addressExist.address.push(addressId);
      await addressExist.save();
      return res.redirect('/user/address');
    }
    else{
      
      const addressId = address._id;
      const userAddress = new Useraddress({user:id});
      userAddress.address.push(addressId);
      await address.save();
      await userAddress.save();
    }
    res.redirect('/user/address');
}

module.exports.showSingleAddress = async(req,res,next)=>{
    const {id} = req.params;
    res.locals.UserId = req.session.username;
    console.log('address id==',id);
    const address = await Address.findById(id);
    console.log('address==',address);
    res.render('users/addressEdit',{address});
  }

  module.exports.updateAddress = async(req,res,next)=>{
    const {id} = req.params;
    res.locals.UserId = req.session.username;
    const editAddrss = await Address.findByIdAndUpdate(id,{...req.body})
    req.flash('success','address updated sucessfully')
    res.redirect('/user/address')
  }

  module.exports.deleteAddress = async(req,res,next)=>{
    const {id} = req.params;
    res.locals.UserId = req.session.username;
    const deleteAddress = await Address.findByIdAndDelete(id);
    req.flash('success','Successfully Deleted');
    res.redirect('/user/address')
  }