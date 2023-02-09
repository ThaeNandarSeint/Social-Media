const cookieOptions = {
    httpOnly: true,
    path: '/api',
    maxAge: 60 * 60 * 1000 //1 hour
}

module.exports = {
    cookieOptions
}