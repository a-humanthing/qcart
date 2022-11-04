const express = require('express');
const Product = require('../model/products');
const router = express.Router();

router.post('/',async(req,res,next)=>{
    const {count} = req.body;
    console.log('count=',count);
    const product = await Product.find().sort('price');
    const filterP = await Product.find().sort('price').skip(count).limit(1);
    console.log('pro',product);
    console.log('fi',filterP);
    res.json({product,filterP})
})

module.exports=router;