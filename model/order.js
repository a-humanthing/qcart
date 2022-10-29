const mongoose = require('mongoose');
const Checkout = require('../model/checkout');
const Address = require('../model/address')
const orderSchema = new mongoose.Schema(
    {
      user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    items:[
        {
            product:{
                type:mongoose.Schema.Types.ObjectId,
                ref:'Product',
                
            },
            quantity:{
                type:Number,
                default:1
            },
            price:{
                type:Number,
                
            }
        }
            
    ],
 
    bill:{
        type:Number,
        
        default:0
    },
    address:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Address"
    },
      
      paymentStatus: {
        type: String,
        enum: ["pending", "completed", "cancelled", "refund"],
        required: true,
      },
      paymentType: {
        type: String,
        enum: ["cod", "online"],
        required: true,
      },
      orderStatus: [
        {
          type: {
            type: String,
            enum: ["ordered","packed", "shipped", "delivered","cancelled"],
            default: "ordered",
          },
          date: {
            type: Date,
          },
          isCompleted: {
            type: Boolean,
            default: false,
          },
        },
      ],
      expecteddate:{
        type:Date,
        default: () => new Date(+new Date() + 7*24*60*60*1000)
      }
    },
    { timestamps: true }
  );
  
  module.exports = mongoose.model("Order", orderSchema);