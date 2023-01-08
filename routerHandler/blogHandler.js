const express = require("express")
const multer = require("multer")
const PostBlog = require("../models/blogSchema")
const path = require("path")
const router = express.Router();

const Storage = multer.diskStorage({
    destination: "../client/public/uploads",
    filename:(req, file, cb) => {
        cb(null, file.fieldname+"_hello"+Date.now()+path.extname(file.originalname))
    }
})

const upload = multer({
    storage: Storage,
    fileFilter: (req, file, cb) => {
        if(
            
            file.mimetype === "image/png" ||
            file.mimetype === "image/jpg" ||
            file.mimetype === "image/jpeg"
        ){
            console.log("Upload");
            cb(null, true)
        }else{
            console.log("Upload no");
        }
    }
}).single("file")

router.post("/post", upload, async (req, res) => {
    try{
        const postBlog = new PostBlog({
            theme: "Theme One",
            title: req.body.title,
            file: req.body.file,
            firstDescription: req.body.firstDescription,
            secondImage: req.body.secondImage,
            secondDescription: req.body.secondDescription,
            thirdImage: req.body.thirdImage,
            fourthImage: req.body.fourthImage,
            thirdDescription: req.body.thirdDescription,
        })
        postBlog.save()
        res.status(200).send({
            message: "Post Successful"
        })
    }
    catch(err){
        res.status(500).send({
            error: "This is server side error"
        })
    }
})

module.exports = router;