const express = require("express")
const mongoose = require("mongoose")
const dotenv = require("dotenv")
const cors = require("cors")
const path = require("path")
const usersHandler = require("./routerHandler/usersHandler")
const blogHandler = require("./routerHandler/blogHandler")

const app = express()
app.use(express.json())
app.use(cors())
app.use(express.static(path.join(__dirname, "/")))
dotenv.config()

mongoose.set('strictQuery', true);
mongoose.connect("mongodb://127.0.0.1:27017/blog-desk")
    .then(() => console.log("Database Connected"))
    .catch(err => console.log(err.message))

app.use("/users", usersHandler)
app.use("/blog", blogHandler )

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