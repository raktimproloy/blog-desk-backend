const express = require("express")
const multer = require("multer")
const PostBlog = require("../models/blogSchema")
const User = require("../models/usersSchema")
const Comment = require("../models/commentSchema")
const path = require("path")
const {v4: uuidv4} = require("uuid")
const router = express.Router();
const {CloudinaryStorage} = require("multer-storage-cloudinary")
const dotenv = require("dotenv")
const cloudinary = require("cloudinary").v2


cloudinary.config({
    cloud_name: process.env.CLOUDNAME,
    api_key: process.env.CLOUDAPIKEY,
    api_secret: process.env.CLOUDINARYSECRET,
    secure: true
  })

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

const upload = multer({storage, fileFilter, key: function(req, file, cb) {
    cb(null, file.originalname)
}})


// Post Blog
router.post("/post", upload.fields([
    {name: "BlogImageOne", maxCount: 1},
    {name: "BlogImageTwo", maxCount: 1},
    {name: "BlogImageThree", maxCount: 1},
    {name: "BlogImageFour", maxCount: 1},
]), async (req, res) => {
    try{
        const BlogImageOneCloudinary = await cloudinary.uploader.upload(req.files.BlogImageOne[0].path, {"folder": "blog-desk/blogs"});
        // const BlogImageTwoCloudinary = req.files.BlogImageTwo === undefined ? undefined : await cloudinary.uploader.upload(req.files.BlogImageTwo[0].path, {"folder": "blog-desk/blogs"});
        const BlogImageTwoCloudinary = req.body.theme >= 2 ? await cloudinary.uploader.upload(req.files.BlogImageTwo[0].path, {"folder": "blog-desk/blogs"}) : undefined;
        const BlogImageThreeCloudinary = req.body.theme >= 3 ? await cloudinary.uploader.upload(req.files.BlogImageThree[0].path, {"folder": "blog-desk/blogs"}) : undefined;
        const BlogImageFourCloudinary = req.body.theme == 4 ? await cloudinary.uploader.upload(req.files.BlogImageFour[0].path, {"folder": "blog-desk/blogs"}) : undefined;

        const postBlog = new PostBlog({
            theme: req.body.theme,
            title: req.body.title,
            category: req.body.category,
            BlogImageOne:  BlogImageOneCloudinary.secure_url,
            BlogImageTwo: BlogImageTwoCloudinary === undefined ? undefined : BlogImageTwoCloudinary.secure_url,
            BlogImageThree: BlogImageThreeCloudinary === undefined ? undefined : BlogImageThreeCloudinary.secure_url,
            BlogImageFour: BlogImageFourCloudinary === undefined ? undefined : BlogImageFourCloudinary.secure_url,
            firstDescription: req.body.firstDescription,
            secondDescription: req.body.secondDescription,
            thirdDescription: req.body.thirdDescription,
            author: req.body.userId,
            ratingPoint: 0,
            views: 0,
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
            message: "Post Successful",
            blogId: blog._id
        })
    }
    catch(err){
        console.log(err);
        res.status(500).send({
            error: "This is server side error"
        })
    }
})



router.delete("/delete/:id", async (req, res) => {
    try{
        const blog = await PostBlog.findById({_id: req.params.id})
        if(blog.author){
            await PostBlog.deleteOne({_id: req.params.id})
            await User.updateOne({
                _id: blog.author
            }, {
                $pull: {
                    blogs: req.params.id
                }
            })
            .then(res => {
                console.log("success","deleted");
            })
            .catch(err => {
                console.log("Not success","Not deleted");
            })
            res.status(200).json({
                message: "deleted successful"
            })
        }
    }
    catch(err){
        console.log("success","Not deleted");
        res.status(500).send({
            error: "There was a server side problem!"
        })
    }
})

router.get("/author/:id", async (req, res) => {
    try{
        const user = await User.find({_id: req.params.id}).select({
            __v: 0,
            password: 0
        })
        res.status(200).json(user)
    }
    catch(err){
        res.status(500).json(err)
    }
})

// Get Blog By id
router.get("/:id", async (req, res) => {
    const blog = await PostBlog.find({_id: req.params.id})
    res.status(200).json(blog)
})

// Get All Blogs
router.get("/blogs/all",  (req, res) => {
    try{
        const blogs =  PostBlog.find({}, (err, result) => {
            if(err){
                res.status(500).send("internal server error")
            }else{
                res.status(200).send(result)
            }
        })
    }
    catch(err){
        res.status(500).send("internal server error")
    }
    
})

// Post Like
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
                },
                $set: {
                    ratingPoint: 3
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

// Post Comment By Blog Id
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

// Get Comment By Blog Id
router.get("/comment/:id", async (req, res) => {
    try{
        const comment = await Comment.find({_id: req.params.id})
        res.status(200).json(comment)
    }
    catch(err){
        console.log(err);
    }
})

// make view Count on blog
router.put("/views/:id", async (req, res) => {
    try{
        const views = req.body.views
        const updateviews = {
            views
        }
        const result = PostBlog.findByIdAndUpdate({_id: req.params.id}, {
            $set: updateviews
        }, {
            new: true
        }, (err, doc) => {
            if(err){
                console.log("No Views");
            }else{
                console.log("views");
            }
        })
    }
    catch(err){

    }
})

router.put("/update/:id", async (req, res) => {
    try{
        const updatedBlogData = req.body
        const result = PostBlog.findByIdAndUpdate({_id: req.params.id}, {
            $set: updatedBlogData
        }, {
            new: true
        }, (err, doc) => {
            if(err){
                console.log("Not Updated");
            }else{
                console.log("Updated");
            }
        })
    }
    catch(err){

        console.log(err);
    }
})






module.exports = router;