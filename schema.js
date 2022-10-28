const Joi = require('joi');
module.exports.userJoiSchema = Joi.object({
        username: Joi.string().pattern(/^[a-zA-Z ]*$/).required(),
        email: Joi.string().required(),
        phone:Joi.string().length(10).pattern(/^[0-9]+$/).required(),
        status:Joi.string(),
        password:Joi.string().min(4).max(12).required().label('password'),
        cpassword:Joi.any().equal(Joi.ref('password'))
        .required()
        .label('confirm password')
        .options({messages:{'any.only':'{{#label}} does not match'}})
        

}) 
module.exports.wishJoiSchema = Joi.object({
        user:Joi.object
})

