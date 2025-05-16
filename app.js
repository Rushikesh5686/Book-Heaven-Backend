const express = require('express')
const app=express();
app.use(express.json())
require ("dotenv").config();
require("./conn/conn")
const user=require('./routes/user')
const Books=require("./routes/book")
const favourites=require("./routes/favourties")
const cart=require("./routes/cart")
const order=require("./routes/order")
const cors=require("cors")
//routes
app.use(cors())
app.use('/api',user)
app.use("/api",Books)
app.use("/api",favourites)
app.use("/api",cart)
app.use("/api",order)
app.get("/",(req,res)=>{
    res.send("Hello from backend")
})
app.listen(process.env.PORT ,()=>{
    console.log("SErver started")

})
