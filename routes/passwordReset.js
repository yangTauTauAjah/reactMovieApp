const { Router } = require('express')
const router = Router()

const { get, put } = require('../controller/passwordResetController.js')

router.get('/', get)
router.put('/', put)

module.exports = router