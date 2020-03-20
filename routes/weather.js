const express = require("express");
const router = express.Router();
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
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

router.get("/:id", async(req,res) =>{
    try{
        let city = await City.findById(req.params.id);
        if(getLastUpdated(city.lastUpdated)){
            res.send(toJSON(city.weather));
            return;
        }else{
            updateCity(city,res);
            return;
        }
            
    }catch(e){
        errorLog(e);
        res.send(toJSON("undefined"));
    }
});

getLastUpdated = time =>{
    let date = new Date();
    return (date.getYear() == time.getYear() && date.getMonth() == time.getMonth() && date.getDate() == time.getDate());
}

updateCity = (city,res) =>{
    let weatherReq = new XMLHttpRequest();
    weatherReq.onreadystatechange = async function(){
        if(this.readyState == 4 && this.status == 200){
            let data =  JSON.parse(weatherReq.responseText);
            city.weather = data.weather[0].main;
            city.lastUpdated = new Date();
            try{
                await city.save();
            }catch(e){
                errorLog(e);
            }
            res.send(toJSON(city.weather));
        }
    };
    weatherReq.open("GET", `https://api.openweathermap.org/data/2.5/weather?q=${city.name}&appid=2eb78cd83e92a1a54b19f1940b9b1821`, true);
    weatherReq.send();
}

toJSON = string =>{
    return JSON.stringify(string);
}

module.exports = router;