if(process.env.NODE_ENV !== "production"){
    require("dotenv").config();
}

const express = require("express");
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
app.use("/", indexRouter);

app.listen(process.env.PORT || 3000);


/* 
 * Steps to create a new project

 -Create database with Atlas Clusters (choose driver when prompted)
 -Allow access from anywhere (IP whitelist) *Optional*
 -Connect to correct database in .env file
 -Configure congif-vars in heroku correctly, Settings->Config Vars (should mirror what you have in .env)
*/