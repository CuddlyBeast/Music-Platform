const express = require('express');
const session = require('express-session');
const cors =  require('cors');
const helmet = require('helmet');
const path = require('path')
const { connectToSpotifyAPI } = require('./spotifyConnect'); 
const spotifyAuthRoutes = require('./spotify/authRoutes');
const authRoutes = require('./routes/authRoutes');

require("dotenv").config()

const app = express()

app.use(express.json())
app.use(cors())

app.use(helmet.contentSecurityPolicy({
    directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'",  "https://unpkg.com/", "https://cdnjs.cloudflare.com"],
        connectSrc: ["'self'", "https://unpkg.com/"],
        fontSrc: ["'self'", "https://fonts.googleapis.com/", "https://fonts.gstatic.com", "https://unpkg.com/"],
        styleSrc: ["'self'", "https://fonts.googleapis.com/", "https://unpkg.com/"],
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

app.use(express.static(path.join(__dirname, "public"))); 

app.get('/', (req, res, next) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});


app.use((err, req, res, next) => {
    console.log(err.stack);
    res.status(500).send('Something went wrong!')
})

app.use('/chill', spotifyAuthRoutes);
app.use('/chill', authRoutes);

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
});

connectToSpotifyAPI();