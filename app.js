require('dotenv').config()
// let fs = require('fs')
// let path = require('path')
let express = require('express')
let cookieParser = require('cookie-parser')
let cors = require('cors')
let app = express()

// const page = fs.readFileSync(path.join(__dirname, 'index.html'))

let authRoute = require('./routes/auth.js')
let favRoute = require('./routes/fav.js')
let watchListRoute = require('./routes/watchList.js')
let passwordReset = require('./controller/passwordReset.js')

const { authValidator } = require('./validator/authValidator.js')

app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(cors({
  origin: ['http://localhost:3001', 'http://localhost:5500'],
  credentials: true,
}))

app.use((req, res, next) => {
  console.log({
    origin: req.get('origin'),
    route: `${req.method} ${req.url}`,
    ip: req.ip,
    cookies: req.cookies,
    body: req.body
  })

  next()
})

/* app.get('/page', (req, res) => {
  res.status(200)
    .cookie('sid', 'test', {
      secure: true,
      sameSite: 'none',
      maxAge: 10000,
      httpOnly: false
    })
    .write(page)
  
  res.end()
}) */

app.use('/auth', authRoute)
app.use('/fav', authValidator, favRoute)
app.use('/watchList', authValidator, watchListRoute)
app.put('/passwordReset', passwordReset)

app.use('/', express.static('public'))

app.use("*", (req, res) => res.status(404).json({ message: '404 page not found' }))

module.exports = app