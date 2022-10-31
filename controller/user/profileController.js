const User = require('../../model/user');


module.exports.showProfile = async (req, res, next) => {
    const id = req.user._id;
    res.locals.UserId = req.session.username;
    const user = await User.findById(id);
    res.render("users/info", { user });
}

module.exports.showProfileInfo =  async (req, res) => {
    res.locals.UserId = req.session.username;
    const id = req.user._id;
    const user = await User.findById(id);
    res.render("users/info", { user });
}

module.exports.renderProfileUpdateForm = async (req, res, next) => {
    res.locals.UserId = req.session.username;
    const id = req.user;
    const user = await User.findById(id);
    res.render("users/infoEdit", { user });
  }

  module.exports.updateProfile = async (req, res, next) => {
    req.flash("error", "This function is Currently Unavailable");
    return res.redirect("/user/profile/info");
    // const {username}=req.body;
    // const id = req.user._id;
    // const regex = /^[a-zA-Z ]*$/;
    // if(regex.test(username)){
    //     console.log(regex.test(username));
    //     const updatedUser = await User.findByIdAndUpdate(id,{username});
    //     console.log(updatedUser);
    //     req.flash('success','Username updated succesfully')
    //     return res.redirect('/user/profile/info');
    // }
    // else{
    //     req.flash('error','Username Is Invalid Try Again');
    //     return res.redirect('/user/profile/info')
    // }
  }