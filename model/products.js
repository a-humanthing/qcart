const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Subcategory = require('../model/subCategory')

const createProducts = new Schema({
    productname:{
        type:String,
        
    },
    category:{
        type:String,
        
    },
    subcategory:{
        type:Schema.Types.ObjectId,
        ref:'Subcategory'
    },
    description:{
        type:String
    },
    price:{
        type:Number
    },
    stock:{
        type:Number
    },
    image:[
        {
        url:String,
        filename:String
        }
    ],
    reviews:[
        {
            type:Schema.Types.ObjectId,
            ref:'Review'
        }
    ]
})

module.exports = mongoose.model('Product',createProducts)