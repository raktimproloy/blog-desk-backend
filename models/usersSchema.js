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
        default: "images/users/default-profile-image.png"
    },
    cloudinary_id: {
        type: String
    },
    facebook: {
        type: String,
    },
    twitter: {
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