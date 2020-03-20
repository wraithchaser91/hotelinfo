if(process.env.NODE_ENV !== "production"){
    require("dotenv").config();
}

const cors = require('cors');
const express = require('express');
let app = express();
app.use(cors());
app.options('*', cors());
const app = express();
const expressLayouts = require("express-ejs-layouts");

app.set("view engine", "ejs");
app.set("views", __dirname + "/views");
app.set("layout", "layouts/layout");
app.use(expressLayouts);
app.use(express.static("public"));

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({limit: "10mb", extended: false}));
app.use(bodyParser.json());

const mongoose = require("mongoose");
mongoose.connect(process.env.DATABASE_URL, {useNewUrlParser:true, useUnifiedTopology:true});
const db = mongoose.connection;
db.on("error", error=>console.log(error));
db.on("open", ()=>console.log("Connected to mongoose"));

const indexRouter = require("./routes/index");
const apiRouter = require("./routes/api");
const cityRouter = require("./routes/city");
const weatherRouter = require("./routes/weather");
const languageRouter = require("./routes/language");
const timezoneRouter = require("./routes/timezone");
const exchangeRouter = require("./routes/exchange");
app.use("/", indexRouter);
app.use("/api", apiRouter);
app.use("/city", cityRouter);
app.use("/weather", weatherRouter);
app.use("/language",languageRouter);
app.use("/timezone",timezoneRouter);
app.use("/exchange", exchangeRouter);

app.listen(process.env.PORT || 3000);