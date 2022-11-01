const admin = require('../../model/admin');
const Banner = require('../../model/banner');

module.exports.showBanner=async(req,res,next)=>{
    const banners = await Banner.find({});
    // let banners;
    // if(banner.length>0){

    //      banners = banner[0].homeBanner
    // }
    // else{
    //     banners=[];
    // }
    console.log(banners)
    // console.log('banners',banner)
    res.render('admin/banner',{banners})

}

module.exports.showBannerForm = async(req,res,next)=>{
    res.render('admin/createBanner')
}

// module.exports.addBanner= async(req,res,next)=>{
//     const {mainHeading}=req.body;
//     const banner = await Banner.findOne({_id:'6357ecdb24aa5e1c1c6e99dc'});
//     const homebanner= await banner.homeBanner.push(req.body);
//     const itemIndex = banner.homeBanner.findIndex(item=>item.mainHeading==mainHeading);
//     banner.homeBanner[itemIndex].image=req.files.map(f=>({url:f.path,filename:f.filename}))
//     //console.log('home=',itemIndex);
//     //console.log('bann',banner.homeBanner[itemIndex].image[0])
//     //console.log('req.files=',req.files);
//     //console.log('banner=',banner)
//     banner.save();
//     res.redirect('/admin/banner')
// }
module.exports.addBanner = async(req,res,next)=>{
    console.log('req',req.body);
    const banner = new Banner(req.body);
    banner.image=req.files.map(f =>({ url: f.path, filename: f.filename }))
    banner.save();
    console.log('ba',banner);
    res.redirect('/admin/banner')
}

module.exports.showSingleBanner = async(req,res,next)=>{
    const {id} = req.params;
    const banner = await Banner.findById(id);
    //console.log('banners=',banners)
    res.render('admin/showBanner',{banner})
}

module.exports.deleteBanner = async(req,res,next)=>{
    const {id}=req.params;
    // let banner = await Banner.findOne({_id:'6357ecdb24aa5e1c1c6e99dc'});
    // const itemIndex = banner.homeBanner.findIndex((item) => item._id == id);
    // console.log("index==", itemIndex);
    // let item = banner.homeBanner[itemIndex];
    // banner.homeBanner.splice(itemIndex, 1);
    const bannerdel = await Banner.findByIdAndDelete(id);
    console.log('item=',item);
    res.redirect('/admin/banner')
}

module.exports.updateBannerPage = async(req,res,next)=>{
    const {id} = req.params;
    let banner = await Banner.findOne({_id:id});
    res.render('admin/editBanner',{banner});
}

module.exports.updateBanner = async(req,res,next)=>{

    const {mainHeading}=req.body;
    const banner = await Banner.findOne({_id:'6357ecdb24aa5e1c1c6e99dc'});
    //const homebanner= await banner.homeBanner.push({...req.body});
    //const itemIndex = banner.homeBanner.findIndex(item=>item.mainHeading==mainHeading);
    // const imgs = req.files.map(f=>({url:f.path,filename:f.filename}));
    // banner.homeBanner[itemIndex].image.push(...imgs);
    // await banner.save();
    req.flash('success',' Banner Updated Succesfully !')
    res.redirect(`/admin/banner`);
}