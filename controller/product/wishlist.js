const Wishlist = require("../../model/wishlist");
const Product = require("../../model/products");

module.exports.viewWishlist = async (req, res, next) => {
    const id = req.session.user;
    try {
      const wishList = await Wishlist.findOne({ user: id })
        .populate({
          path: "user",
        })
        .populate("product");
      //should add something to handle if wishlist is empty
      const checkNull = await Wishlist.findOne({ product: null });
      if (checkNull) {
        return res.send("Wish list empty");
      } else {
        const wish = wishList.product;
        console.log("wishlist populated =", wishList);
        return res.render("products/wishlist", { wish, wishList });
      }
    } catch (error) {
      next(error);
    }
}

module.exports.addToWishlist = async (req, res, next) => {
    const { proid } = req.params;
    const user = req.session.user;
    let wishlistExist = await Wishlist.findOne({ user });
    if (wishlistExist) {
      //console.log('product exists==',wishlistExist.product.includes(proid));
      if (wishlistExist.product.includes(proid)) {
        //console.log('product exists2==',wishlistExist.product.includes(proid));
        req.flash("error", "product already added to wishlist");
        return res.redirect("back");
      } else {
        await wishlistExist.product.push(proid);
        wishlistExist = await wishlistExist.save();
        // console.log(wishlistExist);
        return res.redirect("back");
      }
    } else {
      const wishList = new Wishlist({ user: user, product: proid });
      await wishList.save();
      res.redirect("back");
    }
  }

module.exports.removeFromWishlist = async (req, res, next) => {
    const { proid } = req.params;
    const user = req.session.user;
    try {
      let wishList = await Wishlist.findOne({ user });
      const itemIndex = wishList.product.indexOf(proid);
      console.log("itemIndex=", itemIndex);
      if (itemIndex > -1) {
        wishList.product.splice(itemIndex, 1);
        await wishList.save();
        return res.redirect("/product/wishlist");
      }
    } catch (e) {
      next(e);
    }
  }