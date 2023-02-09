require('dotenv').config()
require('./db/conn');

const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const fileUpload = require('express-fileupload')
const morgan = require('morgan')
const rateLimit = require('express-rate-limit')
const helmet = require('helmet')
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean')
const hpp = require('hpp');

const app = express()

app.use(helmet())

// to prevent DOS Attack
const limiter = rateLimit({
    max: 100,
    windowMs: 15 * 60 * 1000, //15min
    handler: async (req, res, next) => {
        return res.status(429).json({ status: false, msg: "Too many requests from this IP address, Please try again in an hour !" })
    }
})
app.use(limiter)

app.use(express.json({ limit: '10mb' }))
app.use(cors())
app.use(cookieParser())

// to upload file from form data
app.use(fileUpload({
    useTempFiles: true
}))

// data sanitization against nosql query injection
app.use(mongoSanitize());
// data sanitization against XSS -> malicious HTML code
app.use(xss())
// to protect against HTTP Parameter Pollution attacks.
app.use(hpp());

// server
const PORT = process.env.PORT || 5000
app.listen(PORT, ()=>{
    console.log(`Server is running on port ${PORT}`)
})
// middleware
const { authUser } = require('./middlewares/authUser');
const { authAdmin } = require('./middlewares/authAdmin');

// Routes
const authRoute = require('./routes/authRoute')
const postRoute = require('./routes/postRoute')
const commentRoute = require('./routes/commentRoute')
const groupRoute = require('./routes/groupRoute');
const userRoute = require('./routes/userRoute');

// console.log(authRoute);

app.use('/api/auth', authRoute)
app.use('/api/posts', authUser, postRoute)
app.use('/api/comments', commentRoute)
app.use('/api/groups', groupRoute)
app.use('/api/users', authUser, userRoute)

// handle errors
app.use(morgan('dev'))
app.use((req, res, next)=>{
    const error = new Error('Not Found')
    error.status = 404;
    next(error);
})
app.use((error, req, res, next)=>{
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    })
})