const express = require("express")
const router = express.Router()
const bcrypt = require("bcrypt")
const multer = require("multer")
const path = require("path")
const {v4: uuidv4} = require("uuid")
const jwt = require("jsonwebtoken")
const User = require("../models/usersSchema")

const storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, "images")
        // cb(null, "../client/public/uploads")
    },
    filename: function(req, file, cb) {
        cb(null, uuidv4() + "-"+Date.now()+path.extname(file.originalname))
    }
})

const fileFilter = (req, file, cb) => {
    const allowedFileTypes = ["image/jpeg", "image/jpg", "image/png"]
    if(allowedFileTypes.includes(file.mimetype)){
        cb(null, true)
    }else{
        cb(null, false)
    }
}

const upload = multer({storage, fileFilter})

router.route("/signup").post(upload.single("profileImage"), async (req, res) => {
    try{
        console.log("Akhane");
            const hashedPassword = await bcrypt.hash(req.body.password, 10)
            const fullName = req.body.fullName;
            const email = req.body.email;
            const password = hashedPassword;
            const isVerified = req.body.isVerified;
            const profileImage = req.file.filename
            
            const newUserData = {
                fullName,
                email,
                password,
                isVerified,
                profileImage
            }

            const newUser = new User(newUserData)
        
            newUser.save()
            .then(() => res.json("User Added"))
            .catch(err => res.status(400).json("Error: " + err))
       
    }
    catch (err){  
        console.log("okhane");

        res.status(500).send({
            error: err.message
        })
    }
})

router.post("/login", async (req, res) => {
    try{
        const user = await User.find({email: req.body.email})
        if(user && user.length > 0){
            const isValidPassword = await bcrypt.compare(req.body.password, user[0].password);
            if(isValidPassword){
                const token = jwt.sign({
                    userId: user[0]._id,
                    userFullName: user[0].fullName,
                    email: user[0].email
                }, process.env.JWT_SECRET, {
                    expiresIn: "1h"
                })
                res.status(200).send({
                    token: token,
                    message: "Login Successful"
                })
            }else{
                res.status(401).send({
                    error: "Password not matched"
                }) 
            }
        }else{
            res.status(401).send({
                error: "User not found"
            })  
        }
    }
    catch(err) {
        res.status(500).send({
            error: err.message
        })
    }
})

module.exports = router;