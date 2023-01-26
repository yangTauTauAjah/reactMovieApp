require('dotenv').config()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { errorHandler, response } = require('../functions/functions.js')
const { UserCredential, UserDatas } = require('../database.js')

const login = async (req, res) => {

  let { username, password } = req.body

  try {

    let user = await UserCredential.findOne({ username })

    if (!user) return res.status(404).json({ message: 'User is not registered yet, please create a new one' })

    if (!(await bcrypt.compare(password, user.password)))
      return res.status(401).json({ message: "Username and password doesn't match" })

    const tokenExp = 1000 * 60 * 60 * 24 * 5
    let cookie = jwt.sign({ username, exp: Date.now() + tokenExp }, process.env['SECRET'])

    res.cookie('sid', cookie, {secure: true, maxAge: tokenExp, httpOnly: false})

    return response(res, 200, 'Login successful', {
      sid: cookie,
      username,
    })

  } catch (err) {

    errorHandler(err, res)

  }

}

const register = async (req, res) => {

  let { username, email, password } = req.body

  try {

    let hashPassword = await bcrypt.hash(password, await bcrypt.genSalt(10))

    let newUser = await UserCredential.create({ username, email, password: hashPassword })

    await UserDatas.create({ username, fav: [], watchList: [] })

    let data = {
      username: newUser.get('username'),
      email: newUser.get('email')
    }


    return response(res, 200, 'User succesfully registered', data)

  } catch (err) {

    errorHandler(err, res)

  }

}

const logout = async (req, res) => {

  try {

    return response(res, 200, 'Logged out', {}, {
      'Set-Cookie': `sid=;Max-Age=0;httpOnly=false;path=/`,
      'X-Session-Expired': true,
      'X-User-Authorized': true
    })

  } catch(err) {

    errorHandler(err, res)

  }

}

module.exports = { register, login, logout }