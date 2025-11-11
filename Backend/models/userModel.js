const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    githubId: {
        type: String,
        unique: true
    },
    email:String,
    username: String,
    avatarUrl: String,
    access_token: String
},
{
    timestamps : true
}

)

const User = mongoose.model('User',userSchema)

module.exports = User;