const express = require("express");
const router = express.Router();
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const {errorLog} = require("../utils.js");
const Exchange = require("../models/exchange");
const City = require("../models/city");

router.get("/", async(req, res)=>{
    let currencies = [];
    let cities;
    try{
        const rates = await Exchange.findOne({});
        if(rates){
            for(let i = 0; i < rates.rates.length; i++){
                currencies.push(rates.rates[i].split(":")[0]);
                console.log(rates.rates[i].split(":")[0]);
            }
            cities = await City.find({});
            res.render("exchange", {currencies,cities});
        }else{
            updateRates(res,rates);
        }
    }catch(e){
        errorLog(e);
        res.redirect("/");
    }
});

router.get("/:obj", async(req,res)=>{
    let json = {};
    let obj = JSON.parse(req.params.obj);
    try{
        let city = await City.findById(obj.id);
        if(city){
            let currency = city.currencyCode;
            json.currencyCode = currency;
            let rates = await Exchange.findOne({});
            if(rates && getLastUpdated(rates.lastUpdated)){
                let rateList = rates.rates;
                let rate1;
                let rate2;
                for(let rate of rateList){
                    let bits = rate.split(":");
                    if(bits[0]==obj.base){
                        rate1 = bits[1];
                    }
                    if(bits[0]==currency){
                        rate2 = bits[1];
                    }
                    if(typeof rate1 != "undefined" && typeof rate2 != "undefined")break;
                }
                let mod = 1/rate1;
                rate2*=mod
                json.rate = rate2;
                json.base = obj.base;
            }else{
                updateRates(res,rates);
                return;
            }
        }else{
            json.error = `ERROR: Cant find id: ${obj}`;
        }
    }catch(e){
        errorLog(e);
        json.error = e;
    }
    res.send(json);
});

getLastUpdated = time =>{
    let date = new Date();
    return (date.getYear() == time.getYear() && date.getMonth() == time.getMonth() && date.getDate() == time.getDate() && date.getHours() == time.getHours());
}

updateRates = (res,rates) =>{
    if(!rates){
        rates = new Exchange();
    }
    let req = new XMLHttpRequest();
    req.onreadystatechange = async function(){
        if(this.readyState == 4 && this.status == 200){
            let data =  JSON.parse(req.responseText);
            rates.rates = createRateList(data);
            rates.lastUpdated = new Date();
            try{
                await rates.save();
                res.redirect("/exchange");
            }catch(e){
                errorLog(e);
                res.redirect("/");
            }
        }
    };
    req.open("GET", `http://data.fixer.io/api/latest?access_key=dc9e2622e5bb232eea9acac95e4c25ff&format=1`, true);
    req.send();
}

createRateList = rateList =>{
    return JSON.stringify(rateList.rates).replace("}","").replace("{","").replace(/"/g, "").split(",");
}

module.exports = router;