const express = require("express");
const router = express.Router();
const {errorLog} = require("../utils.js");

router.get("/", (req, res)=>{
    res.render("index");
});

module.exports = router;