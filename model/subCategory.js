const mongoose = require('mongoose');
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;
const subCategorySchema = new Schema({
   subcategory:{
    type:String,
    unique:true
   },
   categoryId:ObjectId,
   delStatus:{
      type:Boolean,
      default:true
   }
})

module.exports = mongoose.model('Subcategory',subCategorySchema);