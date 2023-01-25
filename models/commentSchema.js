const mongoose = require("mongoose")

const commentSchema = mongoose.Schema({
    commentAuthor:{
        type: mongoose.Schema.Types.ObjectId,
    },
    comment:{
        type: String
    },
    blogId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "blogs"
    }
})

const Comment = mongoose.model("comment", commentSchema)
module.exports = Comment