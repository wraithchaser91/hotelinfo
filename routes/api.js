const express = require("express");
const router = express.Router();
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const {errorLog} = require("../utils.js");
const City = require("../models/city");
const Exchange = require("../models/exchange");

router.get("/", (req, res)=>{
    res.render("api");
});

router.get("/city/all", async(req,res)=>{
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

router.get("/city/:name", async(req, res)=>{
    let json = {};
    try{
        const city = await City.findOne({name:req.params.name});
        if(city && getWeatherLastUpdated(city.lastUpdated)){
            json.city = city;
        }else if(city){
            updateCity(city, res);
            return;
        }else{
             json.error = `Could not find city: ${req.params.name}`;
        }
    }catch(e){
        errorLog(e);
        json.error = e;
    } 
    res.send(json);
});

router.get("/exchange/:obj", async(req,res)=>{
    let json = {};
    let obj = JSON.parse(req.params.obj);
    try{
        let city = await City.findById(obj.id);
        if(city){
            let currency = city.currencyCode;
            json.currencyCode = currency;
            let rates = await Exchange.findOne({});
            if(rates && getRatesLastUpdated(rates.lastUpdated)){
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
            }else if(rates){
                updateRates(res,rates);
                return;
            }else{
                json.error = `No rates found for: ${obj}`;
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

router.get("/weather/:id", async(req,res) =>{
    try{
        let city = await City.findById(req.params.id);
        if(getWeatherLastUpdated(city.lastUpdated)){
            res.send(JSON.stringify(city));
            return;
        }else{
            updateCity(city,res);
            return;
        }
            
    }catch(e){
        errorLog(e);
        res.send(JSON.stringify("undefined"));
    }
});

updateCity = (city,res) =>{
    let weatherReq = new XMLHttpRequest();
    weatherReq.onreadystatechange = async function(){
        if(this.readyState == 4 && this.status == 200){
            let data =  JSON.parse(weatherReq.responseText);
            city.weather = data.weather[0].main;
            city.temp = getTemp(data.main.temp);
            city.lastUpdated = new Date();
            try{
                await city.save();
                console.log("city saved");
            }catch(e){
                errorLog(e);
            }
            res.send(JSON.stringify(city));
        }
    };
    weatherReq.open("GET", `https://api.openweathermap.org/data/2.5/weather?q=${city.name}&appid=2eb78cd83e92a1a54b19f1940b9b1821`, true);
    weatherReq.send();
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

getWeather = (city,res) =>{
    let weatherReq = new XMLHttpRequest();
    weatherReq.onreadystatechange = async function(){
        if(this.readyState == 4 && this.status == 200){
            let data =  JSON.parse(weatherReq.responseText);
            city.weather = data.weather[0].main;
            city.temp = getTemp(data.main.temp);
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

getRatesLastUpdated = time =>{
    let date = new Date();
    return (date.getYear() == time.getYear() && date.getMonth() == time.getMonth() && date.getDate() == time.getDate() && date.getHours() == time.getHours());
}

getWeatherLastUpdated = time =>{
    let date = new Date();
    return (date.getYear() == time.getYear() && date.getMonth() == time.getMonth() && date.getDate() == time.getDate());
}

getTemp = init =>{
    let temp = init - 273.15;
    temp = parseFloat(temp.toFixed(1));
    return temp;
}

let italy = [
"Rome",
"Milan",
"Naples",
"Turin",
"Palermo",
"Genoa",
"Bologna",
"Florence",
"Bari",
"Catania",
"Venice",
"Verona",
"Messina",
"Padua",
"Trieste",
"Brescia",
"Taranto",
"Parma",
"Prato",
"Modena",
"Reggio Calabria",
"Reggio Emilia",
"Perugia",
"Livorno",
"Ravenna",
"Cagliari",
"Foggia",
"Rimini",
"Salerno",
"Ferrara",
"Sassari",
"Latina",
"Giugliano in Campania",
"Monza",
"Syracuse",
"Bergamo",
"Pescara",
"Trento",
"Forlì",
"Vicenza",
"Terni",
"Bolzano",
"Novara",
"Piacenza",
"Ancona",
"Andria",
"Udine",
"Arezzo",
"Cesena",
"Lecce",
"Pesaro",
"Barletta",
"Alessandria",
"La Spezia",
"Pistoia",
"Pisa",
"Catanzaro",
"Guidonia Montecelio",
"Lucca",
"Brindisi",
"Torre del Greco",
"Treviso",
"Busto Arsizio",
"Como",
"Marsala",
"Grosseto",
"Sesto San Giovanni",
"Pozzuoli",
"Varese",
"Fiumicino",
"Casoria",
"Asti",
"Cinisello Balsamo",
"Caserta",
"Gela",
"Aprilia",
"Ragusa",
"Pavia",
"Cremona",
"Carpi",
"Quartu SantElena",
"Lamezia Terme",
"Altamura",
"Imola",
"LAquila",
"Massa",
"Trapani",
"Viterbo",
"Cosenza",
"Potenza",
"Castellammare di Stabia",
"Afragola",
"Vittoria",
"Crotone",
"Pomezia",
"Vigevano",
"Carrara",
"Caltanissetta",
"Viareggio",
"Fano",
"Savona",
"Matera",
"Olbia",
"Legnano",
"Acerra",
"Marano di Napoli",
"Benevento",
"Molfetta",
"Agrigento",
"Faenza",
"Cerignola",
"Moncalieri",
"Foligno",
"Manfredonia",
"Tivoli",
"Cuneo",
"Trani",
"Bisceglie",
"Bitonto",
"Bagheria",
"Anzio",
"Portici",
"Modica",
"Sanremo",
"Avellino",
"Teramo",
"Montesilvano",
"Siena",
"Gallarate",
"Velletri",
"Cava de Tirreni",
"San Severo",
"Aversa",
"Ercolano",
"Civitavecchia",
"Acireale",
"Mazara del Vallo",
"Rovigo",
"Pordenone",
"Battipaglia",
"Rho",
"Chieti",
"Scafati",
"Scandicci"
]

findItalyWeather = index =>{
    if(index == italy.length){
        console.log("end");
        return;
    }
    let weatherReq = new XMLHttpRequest();
    weatherReq.onreadystatechange = function(){
        if(this.readyState == 4 && this.status == 200){
            let data =  JSON.parse(weatherReq.responseText);
            let weather = data.weather[0].main.toLowerCase().replace(/ /g, "");
            console.log(italy[index], weather);
            if(weather != "thunderstorm"){
                index++;
                findItalyWeather(index);
            }
        }else if(this.readyState == 4){
            index++;
            findItalyWeather(index);
        }
    };
    weatherReq.open("GET", `https://api.openweathermap.org/data/2.5/weather?q=${italy[index]}&appid=2eb78cd83e92a1a54b19f1940b9b1821`, true);
    weatherReq.send();
}

// findItalyWeather(0);

module.exports = router;