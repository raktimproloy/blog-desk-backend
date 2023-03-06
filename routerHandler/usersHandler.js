const express = require("express")
const router = express.Router()
const bcrypt = require("bcrypt")
const multer = require("multer")
const path = require("path")
const {v4: uuidv4} = require("uuid")
const jwt = require("jsonwebtoken")
const User = require("../models/usersSchema")
const url = require("url")
const nodemailer = require("nodemailer")



var sessionData;

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'raktimproloy@gmail.com',
      pass: 'ohyhbbihkqmslcfp'
    }
  });

const createOtp = () => {
    const number = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
    let otp = ""
    for (let i = 0; i < 6; i++) {
        otp =  otp + number[Math.floor(Math.random() * 10)] 
    }
    return otp;
}

const storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, "images/users")
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
            const hashedPassword = await bcrypt.hash(req.body.password, 10)
            const fullName = req.body.fullName;
            const about = req.body.about;
            const email = req.body.email;
            const password = hashedPassword;
            const isVerified = req.body.isVerified;
            const facebook = req.body.facebook;
            const twitter = req.body.twitter;
            const profileImage = req.file === undefined ? undefined : req.file.path;
            
            const newUserData = {
                fullName,
                about,
                email,
                password,
                isVerified,
                profileImage,
                facebook,
                twitter,
            }

            const newUser = new User(newUserData)
        
            newUser.save()
            .then((resss) => {
                res.json("Signup Successful")
                console.log(resss);
            })
            .catch(error => {
                if (error.name === "MongoServerError" && error.message.indexOf("duplicate") === 7) {
                    res.status(500).send("Email already used");
                }
            })
       
    }
    catch (err){
        res.status(500).send({
            error: 'There was a server side problem!'
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

router.get("/profile/:id", async (req, res) => {
    const query = url.parse(req.url, true).query;
    const user = await User.find({_id: req.params.id}).select({
        __v: 0,
        password: 0
    })
    res.status(200).json(user)
})

let otp;

router.put("/verify/:id", async(req, res) => {
    try{
        if(req.body.forClick === "send"){
            otp = createOtp();
            var mailOptions = {
                from: 'raktimproloy@gmail.com',
                to: req.body.email,
                subject: 'Blog Desk id verification code',
                text:  `Your OTP code is ${otp}`
              };
              
              transporter.sendMail(mailOptions, function(error, info){
                if (error) {
                    res.status(500).json({
                        error: "Email not sent"
                    })
                } else {
                    res.status(200).json({
                        message: "Email sent successful"
                    })
                }
              });
        }else{
            if(req.body.getOtp === otp){
                const isVerified = true;
                const updateUserData = {
                    isVerified,
                }
                const result = User.findByIdAndUpdate({_id: req.params.id},{
                    $set: updateUserData
                },{
                    new:true
                }, (err, doc) => {
                    if(err){
                        res.status(500).json({
                            error:"There was a server side error!"
                        });
                    }else{
                        
                        res.status(200).json({
                            message:"User Verified"
                        });
                    }
                })
            }else{
                res.status(401).json({
                    error:"There was a server side error!"
                });
            }
        }
    }
    catch{

    }
})

router.route("/update/:id").put(upload.single("profileImage"), async (req, res) => {
    try{
        const query = url.parse(req.url, true).query;
        const user = await User.find({email: req.body.email})
        if(user && user.length > 0){
            const isValidPassword = await bcrypt.compare(req.body.password, user[0].password);
            if(isValidPassword){
                if(user[0].isVerified){
                    const fullName = req.body.fullName;
                    const about = req.body.about;
                    const facebook = req.body.facebook;
                    const twitter = req.body.twitter;
                    const profileImage = req.file === undefined ? undefined : req.file.path;
        
                    const updateUserData = {
                        fullName,
                        about,
                        profileImage,
                        facebook,
                        twitter,
                    }
        
                    const result = User.findByIdAndUpdate({_id: req.params.id},{
                        $set: updateUserData
                    },{
                        new:true
                    }, (err, doc) => {
                        if(err){
                            res.status(500).json({
                                error:"There was a server side error!"
                            });
                        }else{
                            
                            res.status(200).json({
                                message:"Update Successful"
                            });
                        }
                    })
                }else{
                    res.status(401).json({
                        error:"Id not verified!"
                    });
                }
                
            }else{
                res.status(401).json({
                    error:"Authentication Error!"
                });
            }
        }else{
            res.status(404).json({
                error:"User not found!"
            });
        }
    }
    catch(err){
        res.status(500).json({
            error:"There was a server side error!"
        });
        console.log(err);
    }
})

module.exports = router;