const express = require("express")
const multer = require("multer")
const PostBlog = require("../models/blogSchema")
const User = require("../models/usersSchema")
const Comment = require("../models/commentSchema")
const path = require("path")
const {v4: uuidv4} = require("uuid")
const router = express.Router();

const storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, "images/blogs")
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
]), async (req, res) => {
    try{
        console.log(req.body.theme);
        console.log(req.files.BlogImageOne); 
        const postBlog = new PostBlog({
            theme: req.body.theme,
            title: req.body.title,
            category: req.body.category,
            BlogImageOne: req.files.BlogImageOne[0].path,
            BlogImageTwo: req.files.BlogImageTwo === undefined ? undefined : req.files.BlogImageTwo[0].path,
            BlogImageThree: req.files.BlogImageThree === undefined ? undefined : req.files.BlogImageThree[0].path,
            BlogImageFour: req.files.BlogImageFour === undefined ? undefined : req.files.BlogImageFour[0].path,
            firstDescription: req.body.firstDescription,
            secondDescription: req.body.secondDescription,
            thirdDescription: req.body.thirdDescription,
            author: req.body.userId,
            postedTime: req.body.postedTime
        })
        const blog = await postBlog.save()
        
        await User.updateOne({
            _id: req.body.userId
        }, {
            $push: {
                blogs: blog._id
            }
        })
        .then(res => {
            console.log("success",res);
        })
        .catch(err => {
            console.log("error",err);
        })


        res.status(200).send({
            message: "Post Successful"
        })
    }
    catch(err){
        console.log(err);
        res.status(500).send({
            error: "This is server side error"
        })
    }
})

router.post("/like/:id", async (req, res) => {
    try{
        console.log("like", req.params);
        console.log("like2",req.body);
        const {clickFor, id} = req.body
        if(clickFor === "like"){
            await PostBlog.updateOne({
                _id: req.params.id
            }, {
                $push: {
                    likes: id
                }
            })
                .then(res => {
                    console.log("success",res);
                })
                .catch(err => {
                    console.log("error",err);
                })
        }else{
            await PostBlog.updateOne({
                _id: req.params.id
            }, {
                $pull: {
                    likes: id
                }
            })
                .then(res => {
                    console.log("success",res);
                })
                .catch(err => {
                    console.log("error",err);
                })
        }
        res.status(200).send({
            liked: true
        })
    }
    catch(err){
        res.status(500).send({
            error: err
        })
    }
})

router.post("/comment/:id", async (req, res) => {
    try{
        const postComment = new Comment({
            commentAuthor: req.body.id,
            comment: req.body.comment,
            blogId: req.params.id
        })
        const comment =  await postComment.save()

        await PostBlog.updateOne({
            _id: req.params.id
        }, {
            $push: {
                comments: comment._id
            }
        })
            .then(res => {
                console.log("success",res);
            })
            .catch(err => {
                console.log("error",err);
            })
            
        res.status(200).send("Comment Successful")
    }
    catch(err){
        console.log(err);
    }
})

router.get("/comment/:id", async (req, res) => {
    try{
        const comment = await Comment.find({_id: req.params.id})
        res.status(200).json(comment)
    }
    catch(err){
        console.log(err);
    }
})

router.get("/:id", async (req, res) => {
    const blog = await PostBlog.find({_id: req.params.id})
    res.status(200).json(blog)
})

module.exports = router;