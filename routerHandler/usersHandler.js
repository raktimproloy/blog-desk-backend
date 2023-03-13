const express = require("express")
const router = express.Router()
const bcrypt = require("bcrypt")
const multer = require("multer")
const path = require("path")
const dotenv = require("dotenv")
const {v4: uuidv4} = require("uuid")
const jwt = require("jsonwebtoken")
const User = require("../models/usersSchema")
const url = require("url")
const nodemailer = require("nodemailer")
const cloudinary = require("cloudinary").v2
// const CryptoJS = require("crypto-js")
const checkToken = require("../middleware/checkToken")
const {CloudinaryStorage} = require("multer-storage-cloudinary")


dotenv.config()

cloudinary.config({
    cloud_name: process.env.CLOUDNAME,
    api_key: process.env.CLOUDAPIKEY,
    api_secret: process.env.CLOUDINARYSECRET,
    secure: true
  })

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

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
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
        console.log(req.file);
        // Test
        // var bytes = CryptoJS.AES.decrypt(req.body.userSignupData, 'my-secret-key@123');
        // var decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
        // Test
        const email = req.body.email;
        if(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)){
            const user = await User.find({email: email})
            if(user && user.length > 0){
                res.status(409).json({error: "Email already used"})
            }else{
                const hashedPassword = await bcrypt.hash(req.body.password, 10)
                const fullName = req.body.fullName;
                const about = "";
                
                const password = hashedPassword;
                const isVerified = false;
                const facebook = "";
                const twitter = "";
                const result = req.file === undefined ? undefined : await cloudinary.uploader.upload(req.file.path, {"folder": "blog-desk/users"});
                const newUserData = {
                    fullName,
                    about,
                    email,
                    password,
                    isVerified,
                    profileImage: result === undefined ? undefined : result.secure_url,
                    facebook,
                    twitter,
                }
    
                const newUser = new User(newUserData)
            
                newUser.save()
                .then((result) => {
                    res.status(200).json({message: "Signup Successful"})
                }).catch((err) => {
                    console.log(err);
                });
            }
        }else{
            res.status(400).json({error: "Invalid email!"})
        }
    }
    catch (err){
        res.status(500).json({
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

router.get("/profile", checkToken, async (req, res) => {
    try{
        const user = await User.find({_id: req.userId}).select({
            __v: 0,
            password: 0
        })
        res.status(200).json(user)
    }
    catch(err){
        res.status(500).json(err)
    }
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
              console.log("send",otp);
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
                console.log("send",otp);
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
                    await cloudinary.uploader.destroy(user[0].cloudinary_id);
                    const fullName = req.body.fullName;
                    const about = req.body.about;
                    const facebook = req.body.facebook;
                    const twitter = req.body.twitter;
                    // const profileImage = req.file === undefined ? undefined : req.file.path;
                    const ImageCloudinary = await cloudinary.uploader.upload(req.file.path, {"folder": "blog-desk/users"});
        
                    const updateUserData = {
                        fullName,
                        about,
                        profileImage: ImageCloudinary.secure_url,
                        cloudinary_id: ImageCloudinary.public_id,
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
    }
})

module.exports = router;