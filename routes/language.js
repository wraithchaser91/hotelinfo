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
    res.render("language", {cities});
});

router.get("/:id", async(req,res)=>{
    let json = {};
    try{
        const city = await City.findById(req.params.id);
        if(city)json.list = city.languages;
        else json.error = `Could not find city: ${id}`;
    }catch(e){
        errorLog(e);
        json.error = e;
    }
    res.send(json);
});

module.exports = router;