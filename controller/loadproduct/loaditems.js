const Product = require("../../model/products");

module.exports.baseLoad = async (req, res, next) => {
  const { baseCount } = req.body;
  const withrating = await Product.aggregate([
    { $match: {} },
    { $unwind: "$reviews" },
    {
      $lookup: {
        from: "reviews",
        localField: "reviews",
        foreignField: "_id",
        as: "rating",
      },
    },
    { $unwind: "$rating" },
    { $group: { _id: "$_id", star: { $sum: "$rating.rating" } } }
  ]);
  console.log("reviews", withrating);
  const baseLoad = await Product.find().sort("price").limit(3);
  console.log('base',baseLoad);
  baseLoad.forEach(item=>{
    for(let rat of withrating){
      if(item._id===rat._id){
        Object.assign(item,{star:`${rat.rating}`});
      }
    }
  })
  console.log('dummyload',baseLoad);
  res.json({ baseLoad });
};

module.exports.infiniteScroll = async (req, res, next) => {
  const { count } = req.body;
  console.log("count=", count);
  const product = await Product.find().sort("price");
  const filterP = await Product.find()
    .sort("price")
    .skip(count * 3)
    .limit(3);
  console.log("pro", product);
  console.log("fi", filterP);
  res.json({ product, filterP });
};
