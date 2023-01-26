const { Router } = require('express')
const router = Router()

const { addMovies, deleteMovies, getMovies } = require('../controller/watchListController.js')

router.get('/', getMovies)
router.post('/', addMovies)
router.delete('/', deleteMovies)

module.exports = router