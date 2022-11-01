const admin = require('../../model/admin');
const Order = require('../../model/order');
const User = require('../../model/user');
const Product = require('../../model/products');

module.exports.showDashboard = async(req,res,next)=>{
    
    //order of today
    const daystart = new Date();
    daystart.setHours(0,0,0,0);
    const dayend = new Date();
    dayend.setHours(23,59,59,999);

    //order of month
    const date = new Date();
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);

    //order revenue

    const revenue = await Order.aggregate([{$group:{_id:null,sum:{$sum:'$bill'}}}])
    let totalRevenue;
    if(revenue.length>0){

        totalRevenue = revenue[0].sum;
    }else{
        totalRevenue=0;
    }
    console.log('rev',revenue)


    const totalOrders = await Order.countDocuments();
    const totalUsers = await User.countDocuments();

    const monthsOrders = await Order.countDocuments({createdAt:{$gte:firstDay,$lt:lastDay}});
   
    const todaysOrders = await Order.countDocuments({createdAt:{$gte:daystart,$lt:dayend}});

    console.log('todays order',todaysOrders);
    const totalProducts = await Product.countDocuments();
    //let totalOrders ;
    let totalReviews;
    res.render('admin/dashboard',{totalUsers,totalProducts,todaysOrders,monthsOrders,totalOrders,totalRevenue});
}

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
