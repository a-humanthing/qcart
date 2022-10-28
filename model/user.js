const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose')

const UserSchema = new Schema({
    email:{
        type:String,
        required:true,
        unique:true
    },
    phone:{
        type:Number,
        required:true,
        unique:true
    },
    status:{
        type:String,
        default:'active'
    },
    createdAt:{
        type:Date,
        default:Date.now
    }
});

UserSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model('User',UserSchema); 