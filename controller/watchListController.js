const { UserDatas, watchList } = require('../database.js')
const { errorHandler, response } = require('../functions/functions.js')

const addMovies = async (req, res) => {

  let { verified_token: { username }, body: { movies } } = req

  try {

    const exist = await watchList.findOne({ id: { $in: movies.map(e => e.id) } })

    if (exist) {

      return response(res, 409, `Movie with id = ${exist.get('id').toString()} has  already exist`, {})

    }

    await watchList.insertMany(movies)

    let data = await UserDatas
      .findOneAndUpdate(
        { username },
        { $addToSet: { watchList: movies.map(e => e.id) } })
    await data.save()

    return response(res, 201, 'Successfully added movies to watch list', {})

  } catch (err) {

    errorHandler(err, res)

  }

}

const deleteMovies = async (req, res) => {

  let { verified_token: { username }, body: { movies } } = req

  try {

    await watchList.deleteMany({ id: { $in: movies } })

    let data = await UserDatas
      .findOneAndUpdate(
        { username },
        { $pull: { watchList: { $in: movies } } })
    await data.save()

    return response(res, 204)

  } catch (err) {

    errorHandler(err, res)

  }

}

const getMovies = async (req, res) => {

  let { verified_token: { username } } = req

  try {

    let user = await UserDatas.findOne({ username })
    let data = await watchList.find({ id: { $in: user.watchList } }).select('-_id -__v')

    return response(res, 200, 'Successfully retrieving movies data', data)

  } catch (err) {

    errorHandler(err, res)

  }

}

module.exports = { addMovies, deleteMovies, getMovies }