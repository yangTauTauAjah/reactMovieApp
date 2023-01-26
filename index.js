require('dotenv').config()
const mongoose = require("mongoose");

mongoose.connect(process.env['MONGO_URI'], () => {
  console.log('MongoDB connection established')
})

const app = require('./app')
const PORT = process.env['PORT']

app.listen(PORT, () => console.log(`listening on port ${PORT}`))