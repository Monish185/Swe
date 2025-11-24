const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    githubId: {
        type: String,
        unique: true
    },
    email:String,
    username: String,
    avatarUrl: String,
    access_token: String,
    repos: [
        {
            owner: { type: String, required: true },
            repo: { type: String, required: true },
            webhookId: { type: Number },
            createdAt: { type: Date, default: Date.now }
        }
    ]
},
{
    timestamps : true
}

)

const User = mongoose.model('User',userSchema)

module.exports = User;