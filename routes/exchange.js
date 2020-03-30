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

module.exports = router;