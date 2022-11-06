const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const categorySchema = new Schema({
   category:{
    type:String,
    
   },
   delStatus:{
      type:Boolean,
      default:true
   },
   image:{
         url:String,
         filename:String
   },
   availableProducts:{
      type:Number,
      default:0
   },
   isDeleted:{
      type:Boolean,
      default:false
   }
},{timestamps:true});

module.exports= mongoose.model('Category',categorySchema);