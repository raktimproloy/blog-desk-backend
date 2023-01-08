const mongoose = require("mongoose")

const postBlogSchema = mongoose.Schema({
    theme: {
        type: String
    },
    title: {
        type: String
    },
    file: {
        type: String
    },
    firstDescription: {
        type: String
    },
    secondImage: {
        type: String
    },
    secondDescription: {
        type: String
    },
    thirdImage: {
        type: String
    },
    fourthImage: {
        type: String
    },
    thirdDescription: {
        type: String
    },
})

const PostBlog = mongoose.model("blog", postBlogSchema)
module.exports = PostBlog