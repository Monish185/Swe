const {generateState} = require("arctic")
const { github } =  require("../Oauth/github");
const axios = require('axios')
const User = require("../models/userModel");

const OAUTH_EXCHANGE_EXPIRY = 10 * 60 * 1000;

exports.login = (req,res) => {
    const state = generateState();

    const url = github.createAuthorizationURL(state,["read:user", "repo", "user:email"]);

    const cookieConfig = {
        httpOnly: true,
        secure: false,
        maxAge: OAUTH_EXCHANGE_EXPIRY,
        sameSite: "lax",
    };

    res.cookie("github_oauth_state",state,cookieConfig);

    res.redirect(url.toString())
}

exports.callbacklogin = async (req,res) => {
    const {code,state} = req.query;

    const {github_oauth_state: storedState} = req.cookies;

    if(!code || !state || !storedState || state !== storedState){
        return res.status(401).json({ error: "Invalid state or code" });

    }


    try{
        const tokens  = await github.validateAuthorizationCode(code);
        console.log("GitHub OAuth token:", tokens);
        
        const UserResponse = await axios.get("https://api.github.com/user", {
      headers: { Authorization: `Bearer ${tokens.accessToken()}` },
    });

    const emailResponse = await axios.get("https://api.github.com/user/emails", {
      headers: { Authorization: `Bearer ${tokens.accessToken()}` },
    });


    const githubUser = UserResponse.data;
    const emailData = emailResponse.data;
    const email = emailData.find(e => e.primary)?.email;

    if(!email){
        return res.status(401).json({ error: "No primary email found" });
    }

    let user = await User.findOne({ githubId: githubUser.id });

    if(user){
        user.email = user.email || email;
        user.username = user.username || githubUser.login;
        user.avatarUrl = user.avatar_url;
        user.access_token = tokens.accessToken();
        await user.save();
    }else{
        user = await User.create({
            githubId: githubUser.id,
            email,
            username: githubUser.login,
            avatarUrl: githubUser.avatar_url,
            access_token: tokens.accessToken(),
        })
    }

    req.session.userId = user._id;
    res.redirect(`http://localhost:5173/repos?token=${tokens.accessToken()}`);
}catch(err){
    return res.status(500).json({error: "Github user fetch details failed",details: err.message})
}

}