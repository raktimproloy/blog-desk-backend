const mongoose = require("mongoose")

const postBlogSchema = mongoose.Schema({
    theme: {
        type: String
    },
    title: {
        type: String
    },
    BlogImageOne: {
        type: String
    },
    firstDescription: {
        type: String
    },
    BlogImageTwo: {
        type: String
    },
    secondDescription: {
        type: String
    },
    BlogImageThree: {
        type: String
    },
    BlogImageFour: {
        type: String
    },
    thirdDescription: {
        type: String
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
    }
})

const PostBlog = mongoose.model("blog", postBlogSchema)
module.exports = PostBlog