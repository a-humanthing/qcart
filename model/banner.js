const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bannerSchema = new Schema({
    homeBanner:[
            {

            bannerName:{
                type:String,
            },
            image:[
                {
                url:String,
                filename:String
                }
            ],
            mainHeading:
            {
                type:String
            },
            subHeading:{
                type:String
            },
            description:{
                type:String
            }
        }
    ]



},{timestamps:true})

module.exports = mongoose.model('Banner',bannerSchema);