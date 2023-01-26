const jwt = require('jsonwebtoken')
const { errorHandler, response } = require('./functions/functions.js')

const passwordResetValidator = async (req, res, next) => {

  let { token } = req.query

  try {

    let data = jwt.verify(token, process.env['SECRET'])

    if (data) {

      if (data.exp > Date.now())
        return next()

      if (data.exp < Date.now())
        return response(res, 410, 'Token expired')

    }

    return response(res, 422, 'Token invalid')


  } catch (err) {

    errorHandler(err, res)

  }

}

module.exports = {passwordResetValidator}