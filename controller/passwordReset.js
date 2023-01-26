let bcrypt = require('bcrypt')
let jwt = require('jsonwebtoken')
const { errorHandler, response } = require('../functions/functions.js')
const { UserCredential } = require('../database.js')

async function passwordReset(req, res) {

  let { newPassword, token } = req.body

  try {

    let data = jwt.verify(token, process.env['SECRET'])

    if (data) {

      if (data.exp > Date.now()/1000) {

        let newHashPassword = await bcrypt.hash(newPassword, await bcrypt.genSalt(10))
        await UserCredential.findOneAndUpdate({ username: data.username }, { password: newHashPassword })

        return response(res, 200, 'Successfully changed password', {
          'Set-Cookie': 'sid=;Max-Age=0'
        })

      }

      if (data.exp < Date.now()/1000)
        return response(res, 410, 'Token expired')

    }

    return response(res, 422, 'Token invalid')


  } catch (err) {

    errorHandler(err, res)

  }

}

module.exports = passwordReset