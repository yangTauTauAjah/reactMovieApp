const request = require('supertest')
const jwt = require('jsonwebtoken')
const app = require('../app.js')
const mongoose = require('mongoose')
const { UserDatas, favMovies } = require('../database.js')

beforeAll(() => {

  mongoose.connect(process.env['MONGO_URI'], () => {
    console.log('MongoDB connection established')
  })

})

afterAll(async () => {

  await mongoose.disconnect()
  console.log('MongoDB connection refused')

})

describe('/fav endpoint', () => {

  const userData = { username: 'test123' }

  let tokenExp = 60 * 60 * 24
  let token = jwt.sign({ username: userData.username, exp: Date.now() + tokenExp }, process.env['SECRET'])

  describe('use /fav/index', () => {

    describe('user provide expired or invalid token', () => {

      it('should return 401, session expired, and authorized false', async () => {

        let tokenExp = -(60 * 60 * 24)
        let token = jwt.sign({ username: userData.username, exp: Date.now() + tokenExp }, process.env['SECRET'])

        await request(app)
          .get('/fav')
          .set('Authorization', `Bearer ${token}`)
          .expect(401)
          .expect('X-Session-Expired', 'true')
          .expect('X-User-Authorized', 'false')

        await request(app)
          .post('/fav')
          .set('Authorization', `Bearer ${token}`)
          .expect(401)
          .expect('X-Session-Expired', 'true')
          .expect('X-User-Authorized', 'false')

        await request(app)
          .delete('/fav')
          .set('Authorization', `Bearer ${token}`)
          .expect(401)
          .expect('X-Session-Expired', 'true')
          .expect('X-User-Authorized', 'false')

      })

    })

  })

  describe('post /fav/index', () => {

    describe('given all movie data doesn\'t exist', () => {

      it('should return 201 and massage', async () => {

        let firstData = [
          {
            id: 'movie1',
            image: 'link/to/movie1/poster',
            title: 'title1',
            description: 'description1'
          },
          {
            id: 'movie2',
            image: 'link/to/movie2/poster',
            title: 'title2',
            description: 'description2'
          },
          {
            id: 'movie3',
            image: 'link/to/movie3/poster',
            title: 'title3',
            description: 'description3'
          },
          {
            id: 'movie4',
            image: 'link/to/movie4/poster',
            title: 'title4',
            description: 'description4'
          },
          {
            id: 'movie5',
            image: 'link/to/movie5/poster',
            title: 'title5',
            description: 'description5'
          },
        ]

        let nextData = [
          {
            id: 'movie6',
            image: 'link/to/movie6/poster',
            title: 'title6',
            description: 'description6'
          },
          {
            id: 'movie7',
            image: 'link/to/movie7/poster',
            title: 'title7',
            description: 'description7'
          },
          {
            id: 'movie8',
            image: 'link/to/movie8/poster',
            title: 'title8',
            description: 'description8'
          },
          {
            id: 'movie9',
            image: 'link/to/movie9/poster',
            title: 'title9',
            description: 'description9'
          },
          {
            id: 'movie10',
            image: 'link/to/movie10/poster',
            title: 'title10',
            description: 'description10'
          },
        ]

        await favMovies.deleteMany({})
        await UserDatas.findOneAndUpdate({ username: userData.username }, { fav: [] })

        const res1 = await request(app)
          .post('/fav')
          .set('Authorization', `Bearer ${token}`)
          .send({ movies: firstData })
          .expect(201)

        let updated = await UserDatas.findOne({ username: userData.username })

        expect(res1.body.message).toBe('Successfully added movies to favorite list')
        expect(updated.fav).toStrictEqual(firstData.map(e => e.id))

        const res2 = await request(app)
          .post('/fav')
          .set('Authorization', `Bearer ${token}`)
          .send({ movies: nextData })
          .expect(201)

        updated = await UserDatas.findOne({ username: userData.username })

        expect(res2.body.message).toBe('Successfully added movies to favorite list')
        expect(updated.fav).toStrictEqual(firstData.concat(nextData).map(e => e.id))

      })

    })

    describe('given one of the movie data already exist', () => {

      it('should return 201 and massage', async () => {

        let data = [
          {
            id: 'movie3',
            image: 'link/to/movie1/poster',
            title: 'title1',
            description: 'description1'
          }
        ]

        const res1 = await request(app)
          .post('/fav')
          .set('Authorization', `Bearer ${token}`)
          .send({ movies: data })
          .expect(422)

        expect(res1.body.message).toBe(`Movie with id = ${data[0].id} has  already exist`)

      })

    })

  })

  describe('get /fav/index', () => {

    it('should return 200 and all the user\' favorite movies', async () => {

      const res = await request(app)
        .get('/fav')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
      
      expect(res.body.data).toBeInstanceOf(Array)
      expect(res.body.data.find(e => !(
        Object.keys(e).length === 4 &&
        e.hasOwnProperty('id') &&
        e.hasOwnProperty('image') &&
        e.hasOwnProperty('title') &&
        e.hasOwnProperty('description')
      ))).toBeFalsy()

    })

  })

  describe('delete /fav/index', () => {

    describe('given all movie data exist', () => {

      it('should return 204 without any message', async () => {
  
        let before = await UserDatas.findOne({ username: userData.username })
  
        let data = ['movie4', 'movie5']
  
        const res = await request(app)
          .delete('/fav')
          .set('Authorization', `Bearer ${token}`)
          .send({ movies: data })
          .expect(204)
  
        expect(res.body).toStrictEqual({})
  
        let after = await UserDatas.findOne({ username: userData.username })
  
        expect(after.fav.length).toBe(before.fav.length - data.length)
        expect(after.fav).toEqual(expect.not.arrayContaining(data))
  
      })

    })

    describe('given one of the movie data doesn\'t exist', () => {

      it('should return 204 without any message', async () => {
  
        let before = await UserDatas.findOne({ username: userData.username })
  
        let data = ['movie4', 'movie6', 'movie7']
  
        const res = await request(app)
          .delete('/fav')
          .set('Authorization', `Bearer ${token}`)
          .send({ movies: data })
          .expect(204)
  
        expect(res.body).toStrictEqual({})
  
        let after = await UserDatas.findOne({ username: userData.username })
  
        expect(after.fav.length).toBe(before.fav.length - 2)
        expect(after.fav).toEqual(expect.not.arrayContaining(data))
  
      })

    })

  })

})