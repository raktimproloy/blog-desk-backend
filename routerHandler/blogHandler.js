const express = require("express")
const multer = require("multer")
const PostBlog = require("../models/blogSchema")
const path = require("path")
const {v4: uuidv4} = require("uuid")
const router = express.Router();

const storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, "images")
        // cb(null, "../client/public/uploads")
    },
    filename:(req, file, cb) => {
        cb(null, uuidv4() +"-"+Date.now()+path.extname(file.originalname))
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

const upload = multer({storage, fileFilter, key: function(req, file, cb) {
    cb(null, file.originalname)
}})

router.post("/post", upload.fields([
    {name: "BlogImageOne", maxCount: 1},
    {name: "BlogImageTwo", maxCount: 1},
    {name: "BlogImageThree", maxCount: 1},
    {name: "BlogImageFour", maxCount: 1},
]), (req, res) => {
    try{
        console.log("Files",req.files);
        const postBlog = new PostBlog({
            theme: req.body.theme,
            title: req.body.title,
            BlogImageOne: req.files.BlogImageOne[0].filename,
            BlogImageTwo: req.files.BlogImageTwo[0].filename,
            BlogImageThree: req.files.BlogImageThree[0].filename,
            BlogImageFour: req.files.BlogImageFour[0].filename,
            firstDescription: req.body.firstDescription,
            secondDescription: req.body.secondDescription,
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