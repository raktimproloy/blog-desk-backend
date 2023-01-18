const mongoose = require("mongoose")

const usersSchema = mongoose.Schema({
    fullName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        match: /.+\@.+\..+/,
        unique: true
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