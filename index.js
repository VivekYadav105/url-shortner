const express = require('express')
const jwt = require('jsonwebtoken')
const morgan = require('morgan')
const bodyParser = require('body-parser')
require("dotenv").config()
const mongoose = require('mongoose')
const cors = require('cors')
const session = require('express-session')
const connectRedis = require('connect-redis')

const authUser = require('./middleware/authMiddleWare') 
const errorHandler = require('./middleware/errorMiddleWare')
const { signIn, signOut, signUp } = require('./controllers/userController')
const { generateUrl, fetchUrl } = require('./controllers/shortUrlController')
const { client } = require('./redis-config')
const RedisStore = connectRedis(session)


const app = express()
const port = process.env.PORT

app.use(bodyParser.urlencoded({extended:true}))
app.use(bodyParser.json())
app.use(cors())
app.use(morgan('dev'))
app.set('trust proxy',1)
app.use(session(
    {
        store:new RedisStore({client:client}),
        saveUninitialized:false,
        secret:process.env.SESSION_SECRET,
        resave:false,
        cookie:{
            secure:false,
            httpOnly:true,
            maxAge:2*3600000
        }
    }
))

app.route('/user/login').post(signIn);
app.route('/user/signup').post(signUp);
app.route('/user/signOut').get(authUser,signOut);
app.route('/shortUrl/generate').post(authUser,generateUrl);
app.post('/:shortId',authUser,fetchUrl)

app.use(errorHandler)

mongoose.connect(process.env.MONGO_URI)
            .then((succ)=>{console.log(succ.connection.host)})
            .catch((err)=>{
                console.log(err.message)
            })


app.listen(port,(err)=>{
    if(err) console.log(err.message)
    else console.log("Listening on port "+port)
})
