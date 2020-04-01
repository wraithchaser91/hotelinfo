const express = require("express");
const router = express.Router();
const {errorLog} = require("../utils.js");
const City = require("../models/city");

router.get("/", async(req, res)=>{
    let cities = [];
    try{
        cities = await City.find({}).sort({name:1}).exec();
    }catch(e){errorLog(e);}
    res.render("city",{cities});
});

router.get("/new", (req,res)=>{
    res.render("city/new");
});

router.post("/auto-pop", (req, res)=>{
    let city = new City({name:req.body.city,country:changeName(req.body.country)});
    res.render("city/auto_pop", {city});
});

router.post("/save-city", async(req, res)=>{
    let city = new City({
        name: req.body.city,
        country: req.body.country,
        currencyCode: req.body.currencyCode,
        languages: createList(req.body.languageList),
        lat: req.body.lat,
        lon: req.body.lon
    });
    getWeather(city,res);
});

router.get("/update/:id", async(req,res)=>{
    let city;
    try{
        city = await City.findById(req.params.id);
    }catch(e){
        errorLog(e);
    }
    res.render("city/update", {city})
});

router.post("/update/:id", async(req,res)=>{
    try{
        let city = await City.findById(req.params.id);
        if(!city || typeof city == "undefined"){
            res.redirect("/city");
            return;
        }
        city.name = req.body.city,
        city.country = req.body.country,
        city.currencyCode = req.body.currencyCode,
        city.languages = createList(req.body.languageList),
        city.lat = req.body.lat,
        city.lon = req.body.lon,
        await city.save();
    }catch(e){
        errorLog(e);
    }
    res.redirect("/city");
})

createList = string =>{
    return string.replace(/ /g, "").split(",");
}

changeName = name =>{
    if(name=="USA")return "United States of America";
    if(name=="England")return "United Kingdom of Great Britain and Northern Ireland";
    if(name=="Scotland")return "United Kingdom of Great Britain and Northern Ireland";
    if(name=="Wales")return "United Kingdom of Great Britain and Northern Ireland";
    if(name=="Northern Ireland")return "United Kingdom of Great Britain and Northern Ireland";
    if(name=="Tanzania")return "Tanzania, United Republic of"
    if(name=="Iran")return "Iran, (Islamic Republic of)"
    return name;
}

module.exports = router;