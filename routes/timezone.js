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
    res.render("timezone", {cities});
});

router.get("/:id", async(req,res)=>{
    let json = {};
    try{
        const city = await City.findById(req.params.id);
        if(city){
            let newTime = new Date(findTime(city.timeZone));
            json.time = newTime.toLocaleTimeString();
        }else json.error = `Could not find city: ${id}`;
    }catch(e){
        errorLog(e);
        json.error = e;
    }
    res.send(json);
});

findTime = time =>{
    let date = new Date();
    return date.setHours(date.getHours()+time);
}

module.exports = router;