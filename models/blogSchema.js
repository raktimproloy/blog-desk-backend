const mongoose = require("mongoose")

const postBlogSchema = mongoose.Schema({
    theme: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    BlogImageOne: {
        type: String,
        required: true
    },
    firstDescription: {
        type: String,
        required: true
    },
    BlogImageTwo: {
        type: String,
        required: function() {
            return this.theme >= 2
        }
    },
    secondDescription: {
        type: String,
        required: function() {
            return this.theme >= 2
        }
    },
    BlogImageThree: {
        type: String,
        required: function() {
            return this.theme >= 3
        }
    },
    BlogImageFour: {
        type: String,
        required: function() {
            return this.theme >= 4
        }
    },
    thirdDescription: {
        type: String,
        required: function() {
            return this.theme >= 3
        }
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
    },
    postedTime: {
        type: String,
    },
    ratingPoint: {
        type: Number
    },
    views: {
        type: Number
    },
    likes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users"
        }
    ],
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "comment"
        }
    ]
})

const PostBlog = mongoose.model("blog", postBlogSchema)
module.exports = PostBlog