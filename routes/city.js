const express = require("express");
const router = express.Router();
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const {errorLog} = require("../utils.js");
const City = require("../models/city");
let css = ["city"];

router.get("/", async(req, res)=>{
    let cities = [];
    try{
        cities = await City.find({}).sort({name:1}).exec();
    }catch(e){errorLog(e);}
    res.render("city",{css,cities});
});

router.get("/all", async(req,res)=>{
    let cities = {};
    let list = [];
    try{
        const cityList = await City.find({}).sort({name:1}).exec();
        for(let name of cityList){
            list.push(name.name);
        }
    }catch(e){
        errorLog(e);
    }
    cities.list = list;
    res.send(cities);
});

router.get("/new", (req,res)=>{
    res.render("city/new",{css});
});

router.post("/auto-pop", (req, res)=>{
    let city = new City({name:req.body.city,country:changeName(req.body.country)});
    res.render("city/auto_pop", {css, city});
});

router.post("/save-city", async(req, res)=>{
    let city = new City({
        name: req.body.city,
        country: req.body.country,
        currencyCode: req.body.currencyCode,
        languages: createList(req.body.languageList),
        timeZone: req.body.timeZone,
        lat: req.body.lat,
        lon: req.body.lon
    });
    getWeather(city,res);
});

router.get("/:name", async(req, res)=>{
    let json = {};
    try{
        const city = await City.findOne({name:req.params.name});
        if(city)json.city = city;
        else json.error = `Could not find city: ${req.params.name}`;
    }catch(e){
        errorLog(e);
        json.error = e;
    } 
    res.send(json);
});

router.get("/update/:id", async(req,res)=>{
    let city;
    try{
        city = await City.findById(req.params.id);
    }catch(e){
        errorLog(e);
    }
    res.render("city/update", {css,city})
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
        city.timeZone = req.body.timeZone,
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

getWeather = (city,res) =>{
    let weatherReq = new XMLHttpRequest();
    weatherReq.onreadystatechange = async function(){
        if(this.readyState == 4 && this.status == 200){
            let data =  JSON.parse(weatherReq.responseText);
            city.weather = data.weather[0].main;
            try{
                await city.save();
            }catch(e){
                errorLog(e);
            }
            res.redirect("/city");
        }
    };
    weatherReq.open("GET", `https://api.openweathermap.org/data/2.5/weather?q=${city.name}&appid=2eb78cd83e92a1a54b19f1940b9b1821`, true);
    weatherReq.send();
}

module.exports = router;