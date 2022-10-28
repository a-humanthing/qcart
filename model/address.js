const { types } = require('joi');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const addressSchema = new Schema({

        name: {
            type: String,
            required: true,
            trim: true,
            min: 2,
            max: 20,
          },
          mobile: {
            type: Number,
            required: true,
            trim: true,
          },
          pincode: {
            type: Number,
            required: true,
            trim: true,
          },
          address: {
            type: String,
            required: true,
            trim: true,
            min: 4,
            max: 50,
          },
          cityDistrictTown: {
            type: String,
            required: true,
            trim: true,
          },
          state: {
            type: String,
            required: true,
          },
          landmark: {
            type: String,
            min: 4,
            max: 50,
          },
          alternatephone: {
            type: Number,
          },
          addresstype: {
            type: String,
            required: true,
            enum: ["home", "work"],
            required: true,
          }
      
     
},{timestamps:true});


module.exports = mongoose.model('Address',addressSchema);