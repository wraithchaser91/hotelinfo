const express = require("express");
const router = express.Router();
const {errorLog} = require("../utils.js");
const City = require("../models/city");

router.get("/", async(req, res)=>{
    let cities;
    try{
        cities = await City.find({});
    }catch(e){
        errorLog(e);
    }
    res.render("weather", {cities});
});

module.exports = router;