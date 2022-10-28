const { types } = require('joi');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const User = require('../model/user')
const Address = require('../model/address')
const userAddressSchema= new Schema({
    user:{
      type:Schema.Types.ObjectId,
      ref:'User',
      required:true
    },
    address:  [
      {
      type:Schema.Types.ObjectId,
      ref:'Address',
      required:true
    }
    ]
  },{timestamps:true});


  module.exports = mongoose.model('Useraddress',userAddressSchema);