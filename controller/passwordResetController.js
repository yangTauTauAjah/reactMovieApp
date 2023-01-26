const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { UserCredential } = require('../database.js')
const { errorHandler, response } = require('./functions/functions.js')

const get = async (req, res) => {

  let { token } = req.query

  try {

    let data = jwt.verify(token, process.env['SECRET'])
    return response(res, 200, '', { username: data.username })

  } catch (err) {

    errorHandler(err, res)

  }

}

const put = async (req, res) => {

  let { token } = req.query
  let { newPassword } = req.body

  try {

    let data = jwt.verify(token, process.env['SECRET'])
    let newHashPassword = await bcrypt.hash(newPassword, await bcrypt.genSalt(10))

    await UserCredential.findOneAndUpdate({ username: data.username }, { password: newHashPassword })

    return response(res, 200, 'Successfully changed password')

  } catch (err) {

    errorHandler(err, res)

  }

}

module.exports = { get, put }