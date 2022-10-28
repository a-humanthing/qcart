const {userJoiSchema}= require('./schema');
const ExpressError = require('./utils/ExpressError');

module.exports.isLoggedIn = (req,res,next)=>{
    if(req.isAuthenticated()||req.session.otpVerified){
        console.log(req.user);
        next();
    }
    else
    {
        req.flash('error','must be logged in first ');
        return res.redirect('/user/login');
    }
    
}

module.exports.isActive = (req,res,next)=>{
    if(req.session.otpVerified||(req.user.status&&req.user.status==='active')){
        next();
    }
    else
    {
        req.flash('error','You are currently Blocked');
        return res.redirect('/user/login');
    }
}
module.exports.isBlocked = (req,res,next)=>{
    if(req.user.status==='blocked'){
        req.flash('error','You are currently Blocked');
        return res.redirect('/user/home')
    }
    else{
        next();
    }
}

 module.exports.isAdminAlive = (req,res,next)=>{
    if(!req.session)
    {
        return res.redirect('/admin/login')
    }
}

module.exports.userJoiValidation = (req,res,next)=>{
    
    const {error}= userJoiSchema.validate(req.body);
    console.log(error);
    if(error){
        const msg = error.details.map(el => el.message).join(',')
        req.flash('error',`${msg}`);
        console.log(msg)
        return res.redirect('/user/register')
        // throw new ExpressError(msg,400);
    }
    else
    {
        console.log('next is heere')
        next();
    }
}