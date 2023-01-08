const express = require("express")
const router = express.Router()
const bcrypt = require("bcrypt")
const multer = require("multer")
const path = require("path")
const jwt = require("jsonwebtoken")
const User = require("../models/usersSchema")

const storage = multer.diskStorage({
    destination: "../client/public/uploads",
    filename:(req, file, cb) => {
        cb(null, file.fieldname+"_"+Date.now()+path.extname(file.originalname))
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

router.post("/signup", upload.single("profileImage"), async (req, res) => {
    try{
            const hashedPassword = await bcrypt.hash(req.body.password, 10)
            const user = new User({
                fullName: req.body.fullName,
                email: req.body.email,
                password: hashedPassword,
                isVerified: req.body.isVerified,
                profileImage: req.file.filename
            })
        
            await user.save();
    
            res.status(200).send({
                message: "Signup Successful"
            })
       
    }
    catch (err){  
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