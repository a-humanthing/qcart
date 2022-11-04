const express = require("express");
const Product = require("../model/products");
const router = express.Router();
const onloadController = require("../controller/loadproduct/loaditems");

router.post("/", onloadController.baseLoad);

router.post("/infinitescroll", onloadController.infiniteScroll);

module.exports = router;
