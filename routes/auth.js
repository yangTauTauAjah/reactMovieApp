const { Router } = require('express')
const router = Router()

const { register, login, logout } = require('../controller/authController.js')
const { authValidator, registrationValidator } = require('../validator/authValidator.js')

router.get('/', authValidator, (req, res) => {

  const auth = req.get('Authorization')
  return res.json({
    sid: auth.split(' ')[1],
    username: req.verified_token.username
  })

})

router.post('/register', registrationValidator, register)
router.post('/login', login)
router.delete('/logout', logout)

module.exports = router