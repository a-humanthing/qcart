const User = require('../../model/user');
const Order = require('../../model/order');

module.exports.showAllOrders = async(req,res,next)=>{
    const orders = await Order.find({}).populate('user')
    res.render('admin/orderlist',{orders});
 }

 module.exports.showSingleOrder = async(req,res,next)=>{
    const {id} = req.params;
    const order = await Order.findById(id).populate('user address').populate({path:'items.product'});
    const orderstatus = ['ordered','packed','shipped','delivered','cancelled']
    const stat = order.orderStatus[0].type;
    const index = orderstatus.indexOf(stat);
    const ddate = order.expecteddate;
    res.render('admin/editOrder',{order,orderstatus,index,ddate});
 }

 module.exports.updateOrder = async(req,res,next)=>{
    const {id} = req.params;
    const {orderstatus,expecteddate}=req.body;
    const date = new Date(expecteddate)
    if(expecteddate.length===0){

        const updateorder = await Order.findByIdAndUpdate(id,{$set:{orderStatus:{type:orderstatus,date:new Date(),isCompleted:false}}})
        return res.redirect('back');
    }
    else{
        const updateorder = await Order.findByIdAndUpdate(id,{$set:{expecteddate:date,orderStatus:{type:orderstatus,date:new Date(),isCompleted:false}}})
        //await updateorder.orderStatus.push({type:orderstatus,date:new Date(),isCompleted:false})
        res.redirect('back');
    }


 }