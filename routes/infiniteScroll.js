const express = require('express');
const Product = require('../model/products');
const router = express.Router();

router.post('/',async(req,res,next)=>{
    const {count} = req.body;
    console.log('count=',count);
    const product = await Product.find().sort('price');
    const filterP = await Product.find().sort('price').skip(count*3).limit(3);
    console.log('pro',product);
    console.log('fi',filterP);
    res.json({product,filterP})
})

router.post('/baseload',async(req,res,next)=>{
    const {baseCount}=req.body;
    const baseLoad = await Product.find().sort('price').limit(3);
    res.json({baseLoad});
})

module.exports=router;