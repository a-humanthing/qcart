const express = require("express");
const Product = require("../model/products");
const router = express.Router();
const onloadController = require("../controller/loadproduct/loaditems");
const filterController = require('../controller/loadproduct/categoryLoad');

router.post("/", onloadController.baseLoad);

router.post("/infinitescroll", onloadController.infiniteScroll);
router.post('/category',filterController.baseLoad)
router.post('/pricelh',filterController.priceLH)
router.post('/pricehl',filterController.priceHL)
module.exports = router;
