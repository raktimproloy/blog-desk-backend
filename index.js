const express = require("express")
const mongoose = require("mongoose")
const dotenv = require("dotenv")
const cors = require("cors")
const usersHandler = require("./routerHandler/usersHandler")

const app = express()
app.use(express.json())
app.use(cors({
    origin: ['http://localhost:3000']
}))
dotenv.config()

mongoose.set('strictQuery', true);
mongoose.connect("mongodb://127.0.0.1:27017/blog-desk")
    .then(() => console.log("Database Connected"))
    .catch(err => console.log(err.message))

app.use("/users", usersHandler)

const errorHandler = (err, req, res, next) => {
    if(res.headerSent){
        return next(err)
    }
    res.status(500).json({error: err})
}
app.use(errorHandler)

app.listen(3001, () => {
    console.log("Listening 3001");
})