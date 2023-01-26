const jwt = require('jsonwebtoken')
const { errorHandler, response } = require('../functions/functions.js')
const { UserCredential } = require('../database.js')

const registrationValidator = async (req, res, next) => {

  let { username = '', email = '', password = '' } = req.body

  try {

    if (username === '' || password === '')
      return response(res, 422, 'Please provide valid username and password', {})
    else if (!/^\w+@\w+\.\w+$/.test(email))
      return response(res, 422, 'Please provide valid email', {})
    else if (await UserCredential.findOne({ username }))
      return response(res, 409, 'Username already registered', {})

    next()

  } catch (err) {

    errorHandler(err, res)

  }

}

function authValidator(req, res, next) {

  const auth = req.get('Authorization')

  try {

    if (!auth) {
      return response(res, 401, 'Please provide token', {}, {
        'X-Session-Expired': false,
        'X-User-Authorized': false
      })
    }

    if (!/Bearer .+/.test(auth)) {
      return response(res, 401, 'Token is not valid bearer token', {}, {
        'X-Session-Expired': true,
        'X-User-Authorized': false
      })
    }

    const token = jwt.verify(auth.split(' ')[1], process.env['SECRET'])

    if (!token.hasOwnProperty('username') || !token.hasOwnProperty('exp')) {
      return response(res, 401, 'Invalid token structure', {}, {
        'X-Session-Expired': false,
        'X-User-Authorized': false
      })
    }

    if (token.exp <= Date.now()) {
      return response(res, 401, 'Token expired', {}, {
        'X-Session-Expired': true,
        'X-User-Authorized': false
      })
    }

    const tokenExp = 1000 * 60 * 60 * 24 * 5
    let cookie = jwt.sign({ username: token.username, exp: Date.now() + tokenExp }, process.env['SECRET'])

    res.status(200)
      .set('X-Session-Expired', false)
      .set('X-User-Authorized', true)
      .cookie('sid', cookie, {secure: true, maxAge: tokenExp, httpOnly: false})

    req.verified_token = token

    return next()

  } catch (err) {

    errorHandler(err, res)

  }

}

module.exports = { authValidator, registrationValidator }