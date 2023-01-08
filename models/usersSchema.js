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
        default: "defaultProfile.jpg"
    }
}) 

const User = mongoose.model("User", usersSchema)
module.exports = User;