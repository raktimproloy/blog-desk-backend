const mongoose = require("mongoose")

const usersSchema = mongoose.Schema({
    fullName: {
        type: String,
        required: true
    },
    about: {
        type: String
    },
    email: {
        type: String,
        required: true,
        match: /.+\@.+\..+/
    },
    password: {
        type: String,
        required: true
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    profileImage: {
        type: String,
        default: "https://res.cloudinary.com/dcbantk1f/image/upload/v1679400767/blog-desk/users/default-profile-image_gzw9qp.png"
    },
    cloudinary_id:{
        type: String,
    },
    facebook: {
        type: String,
    },
    twitter: {
        type: String,
    },
    linkedin: {
        type: String,
    },
    instagram: {
        type: String,
    },
    blogs: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "blogs"
        }
    ]
}, {
    timestamps: true
}) 

const User = mongoose.model("User", usersSchema)
module.exports = User;