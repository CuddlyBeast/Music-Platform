const express = require('express');
const session = require('express-session');
const cors =  require('cors');
const helmet = require('helmet');
const path = require('path')
const { connectToSpotifyAPI } = require('./spotifyConnect'); 
const { router: spotifyAuthRoutes } = require('./spotify/authRoutes');
const spotifyRoutes= require('./spotify/spotifyRoutes');
const spotifyPlaybackRoutes= require('./spotify/playbackRoutes');
const authRoutes = require('./routes/authRoutes');

require("dotenv").config()

const app = express()

app.use(express.json())
app.use(cors())

app.use(helmet.contentSecurityPolicy({
    directives: {
        defaultSrc: ["'self'", "https://i.scdn.co"],
        scriptSrc: ["'self'",  "https://unpkg.com/", "https://cdnjs.cloudflare.com"],
        connectSrc: ["'self'", "https://unpkg.com/", "https://accounts.spotify.com"],
        fontSrc: ["'self'", "https://fonts.googleapis.com/", "https://fonts.gstatic.com", "https://unpkg.com/"],
        styleSrc: ["'self'", "https://fonts.googleapis.com/", "https://unpkg.com/"],
        imgSrc: ["'self'", "https://i.scdn.co", "https://image-cdn-ak.spotifycdn.com", 'https://mosaic.scdn.co', 'https://image-cdn-fa', 'https://image-cdn-fa.spotifycdn.com/', 'https://seed-mix-image.spotifycdn.com'],
        frameSrc: ["'self'", "http://localhost:3000/"], 
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

app.get('/genres', (req, res, next) => {
    res.sendFile(path.join(__dirname, "public", "genres.html"));
});

app.get('/recommendations', (req, res, next) => {
    res.sendFile(path.join(__dirname, "public", "recommendations.html"));
});

app.get('/country', (req, res, next) => {
    res.sendFile(path.join(__dirname, "public", "main.html"));
});

app.get('/new', (req, res, next) => {
    res.sendFile(path.join(__dirname, "public", "new.html"));
});

app.get('/albums', (req, res, next) => {
    res.sendFile(path.join(__dirname, "public", "albums.html"));
});

app.get('/artists', (req, res, next) => {
    res.sendFile(path.join(__dirname, "public", "artists.html"));
});

app.get('/selectedAlbum', (req, res, next) => {
    res.sendFile(path.join(__dirname, "public", "selectedAlbum.html"));
});

app.get('/selectedArtist', (req, res, next) => {
    res.sendFile(path.join(__dirname, "public", "selectedArtist.html"));
});


app.get('/playlist', (req, res, next) => {
    res.sendFile(path.join(__dirname, "public", "playlist.html"));
});

app.get('/genreSongs', (req, res, next) => {
    res.sendFile(path.join(__dirname, "public", "genreSongs.html"));
});

app.get('/relax', (req, res, next) => {
    res.sendFile(path.join(__dirname, "public", "relax.html"));
});

app.get('/party', (req, res, next) => {
    res.sendFile(path.join(__dirname, "public", "party.html"));
});

app.use((err, req, res, next) => {
    console.log(err.stack);
    res.status(500).send('Something went wrong!')
})

app.use('/chill', spotifyAuthRoutes);
app.use('/chill', spotifyRoutes);
app.use('/chill', spotifyPlaybackRoutes);
app.use('/chill', authRoutes);

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
});

connectToSpotifyAPI();