const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const couponSchema = new Schema({
    code:{
        type:String,
        require:true,
        unique:true
    },
    isPercent:{
        type:Boolean,
        require:true,
        default:true
    },
    amount:{
        type:Number,
        require:true    // if is percent, then number must be ≤ 100, else it’s amount of discount
    },
    customers:[
        {
            type:Schema.Types.ObjectId,
            ref:'User',
            //unique:true
           
        }
    ],
    percentage:{
        type:Number
    },
    expiryDate:{
        type:Date
    },
    isActive:{
        type:Boolean,
        require:true,
        default:true
    }
},{timestamps:true})

module.exports = mongoose.model('Coupon',couponSchema);