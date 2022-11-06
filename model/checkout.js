const mongoose = require('mongoose');
const Schema = mongoose.Schema;
objectId=Schema.objectId;
const checkoutSchema= new Schema({
    user:{
        type:Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    items:[
        {
            product:{
                type:Schema.Types.ObjectId,
                ref:'Product',
                required:true
            },
            quantity:{
                type:Number,
                default:1
            },
            price:{
                type:Number,
                required:true
            }, 
            discountPrize:{
                type:Number
            }
        }
            
    ],
    bill:{
        type:Number,
        required:true,
        default:0
    },
    address:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Address"
    }
},{timestamps:true});
module.exports = mongoose.model('Checkout',checkoutSchema);