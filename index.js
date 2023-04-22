const express = require('express')
const jwt = require('jsonwebtoken')
const morgan = require('morgan')
const bodyParser = require('body-parser')
require("dotenv").config()
const mongoose = require('mongoose')
const cors = require('cors')

const authUser = require('./middleware/authMiddleWare') 
const errorHandler = require('./middleware/errorMiddleWare')
const { signIn, signOut, signUp } = require('./controllers/userController')
const { generateUrl, fetchUrl } = require('./controllers/shortUrlController')
const {client} = require('./redis-config')

const app = express()
const port = process.env.PORT||5000

app.use(bodyParser.urlencoded({extended:true}))
app.use(bodyParser.json())
app.use(cors())
app.use(morgan('dev'))

app.route('/user/login').post(signIn);
app.route('/user/signup').post(signUp);
app.route('/user/signOut').get(authUser,signOut);
app.route('/shortUrl/generate').post(authUser,generateUrl);
app.route('/:url').post(authUser,fetchUrl)

app.use(errorHandler)

mongoose.connect(process.env.MONGO_URI)
            .then((succ)=>{console.log(succ.connection.host)})
            .catch((err)=>{
                console.log(err.message)
            })

client.connect().then(()=>{
    console.log("connected to redis");
})
app.listen(port,(err)=>{
    if(err) console.log(err.message)
    else console.log("Listening on port "+port)
})