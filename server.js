const express = require('express');
const session = require('express-session');
const cors =  require('cors');
const helmet = require('helmet');
const path = require('path')
const { connectToSpotifyAPI } = require('./spotify/spotify'); 

require("dotenv").config()

const app = express()

app.use(express.json())
app.use(cors())

app.use(helmet.contentSecurityPolicy({
    directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        styleSrc: ["'self'"],
        imgSrc: ["'self'"],
        frameSrc: ["'self'"], 
        formAction: ["'self'"]
    }
}))

const store = session.MemoryStore();

app.use(session({
    secret: 'abzetghkdslpioklds',
    cookie: {maxAge: 14600000, httpOnly: true, sameSite:'none', secure: true},
    resave: false,
    saveUninitialized: false,
    store,
}))


app.use((err, req, res, next) => {
    console.log(err.stack);
    res.status(500).send('Something went wrong!')
})

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
});

connectToSpotifyAPI();