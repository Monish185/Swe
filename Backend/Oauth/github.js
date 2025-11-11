const { GitHub } =  require("arctic");

exports.github = new GitHub(
    process.env.GITHUB_CLIENT_ID,
    process.env.GITHUB_CLIENT_SECRET,
    `${process.env.CALLBACK_URL}/auth/github/callback`

)