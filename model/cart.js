const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const cartSchema = new Schema({
    user:{
        type:Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    cartItem:[
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
            }
        }
            
    ],
    bill:{
        type:Number,
        required:true,
        default:0
    }
},{timestamps:true});
module.exports = mongoose.model('Cart',cartSchema);