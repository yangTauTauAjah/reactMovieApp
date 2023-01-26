const { UserCredential } = require('../../database.js')
const {errorHandler, response} = require('../../functions/functions.js')

const registerValidator = async (req, res, next) => {

  let { username = '', email = '', password = '' } = req.body

  try {

    if (username === '' || password === '') 
      return response(res, 422, 'Please provide valid username and password', {})
    else if (!/^\w+@\w+\.\w+$/.test(email))
      return response(res, 422, 'Please provide valid email', {})
    else if (await UserCredential.findOne({username}))
      return response(res, 409, 'Username already registered', {})
  
    next()

  } catch(err) {

    errorHandler(err, res)

  }

}

module.exports = registerValidator