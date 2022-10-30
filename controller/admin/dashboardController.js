const admin = require('../../model/admin');
const Order = require('../../model/order');
module.exports.sendSalesData=async(req,res,next)=>{
    const date = new Date();
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    const findbyweek = await Order.countDocuments({
        'createdAt':
        {
            $gte:new Date((new Date().getTime()-(7*24*60*60*1000)))
        }
    })
    //const bymonth = await Order.aggregate([{$match:{createdAt:{$gte:new Date().getTime()-(180*24*60*60*1000)}}},{$group:{_id:{$substr:['$createdAt',5,2]},sale:{$sum:'$bill'}}}])
    const byweek = await Order.aggregate([{$match:{createdAt:{$gte:new Date((new Date().getTime()-(7*24*60*60*1000)))}}},{$group:{_id:{$substr:['$createdAt',8,2]},sale:{$sum:'$bill'}}},{$sort:{_id:1}}])
    console.log('byweek',byweek);
    console.log('week',findbyweek);
    res.json(byweek);
}

module.exports.sendMethodData=async(req,res,next)=>{
    const bycod = await Order.aggregate([{$match:{$and:[{paymentType:'cod'},{createdAt:{$gte:new Date((new Date().getTime()-(7*24*60*60*1000)))}}]}},{$group:{_id:{$substr:['$createdAt',8,2]},cod:{$sum:1}}},{$sort:{_id:1}}])
    const byonline = await Order.aggregate([{$match:{$and:[{paymentType:'online'},{createdAt:{$gte:new Date((new Date().getTime()-(7*24*60*60*1000)))}}]}},{$group:{_id:{$substr:['$createdAt',8,2]},cod:{$sum:1}}},{$sort:{_id:1}}])
    console.log('bycod',bycod)
    console.log('byonline',byonline);
    res.json({bycod,byonline});
}
