const request = require('supertest')
const jwt = require('jsonwebtoken')
const app = require('../app.js')
const mongoose = require('mongoose')
const { UserDatas, watchList } = require('../database.js')

beforeAll(() => {

  mongoose.connect(process.env['MONGO_URI'], () => {
    console.log('MongoDB connection established')
  })

})

afterAll(async () => {

  await mongoose.disconnect()
  console.log('MongoDB connection refused')

})

describe('/watchList endpoint', () => {

  const userData = { username: 'test123' }

  let tokenExp = 60 * 60 * 24
  let token = jwt.sign({ username: userData.username, exp: Date.now() + tokenExp }, process.env['SECRET'])

  describe('use /watchList', () => {

    describe('user provide expired or invalid token', () => {

      it('should return 401, session expired, and authorized false', async () => {

        let tokenExp = -(60 * 60 * 24)
        let token = jwt.sign({ username: userData.username, exp: Date.now() + tokenExp }, process.env['SECRET'])

        await request(app)
          .get('/watchList')
          .set('Authorization', `Bearer ${token}`)
          .expect(401)
          .expect('X-Session-Expired', 'true')
          .expect('X-User-Authorized', 'false')

        await request(app)
          .post('/watchList')
          .set('Authorization', `Bearer ${token}`)
          .expect(401)
          .expect('X-Session-Expired', 'true')
          .expect('X-User-Authorized', 'false')

        await request(app)
          .delete('/watchList')
          .set('Authorization', `Bearer ${token}`)
          .expect(401)
          .expect('X-Session-Expired', 'true')
          .expect('X-User-Authorized', 'false')

      })

    })

  })

  describe('post /watchList', () => {

    describe('given all movie data doesn\'t exist', () => {

      describe('adding movie data for the first time', () => {

        it('should return 201 and massage', async () => {
  
          await watchList.deleteMany({})
          await UserDatas.findOneAndUpdate({ username: userData.username }, { watchList: [] })
  
          let data = [
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
  
          const before = await UserDatas.findOne({ username: userData.username })
  
          const res = await request(app)
            .post('/watchList')
            .set('Authorization', `Bearer ${token}`)
            .send({ movies: data })
            .expect(201)
  
          const after = await UserDatas.findOne({ username: userData.username })
  
          expect(res.body.message).toBe('Successfully added movies to watch list')
          expect(after.watchList).toStrictEqual(before.watchList.concat(data.map(e => e.id)))
  
        })

      })

      describe('adding movie data after the first time', () => {

        it('should return 201 and massage', async () => {
  
          const before = await UserDatas.findOne({ username: userData.username })
  
          let data = [
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
  
          const res = await request(app)
            .post('/watchList')
            .set('Authorization', `Bearer ${token}`)
            .send({ movies: data })
            .expect(201)
  
          const after = await UserDatas.findOne({ username: userData.username })
  
          expect(res.body.message).toBe('Successfully added movies to watch list')
          expect(after.watchList).toStrictEqual(before.watchList.concat(data.map(e => e.id)))
  
        })
      
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

        const res = await request(app)
          .post('/watchList')
          .set('Authorization', `Bearer ${token}`)
          .send({ movies: data })
          .expect(409)

        expect(res.body.message).toBe(`Movie with id = ${data[0].id} has  already exist`)

      })

    })

  })

  describe('get /watchList', () => {

    it('should return 200 and all the user\' watch list', async () => {

      const res = await request(app)
        .get('/watchList')
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

  describe('delete /watchList', () => {

    describe('given all movie data exist', () => {

      it('should return 204 without any message', async () => {
  
        let before = await UserDatas.findOne({ username: userData.username })
  
        let data = ['movie4', 'movie5']
  
        const res = await request(app)
          .delete('/watchList')
          .set('Authorization', `Bearer ${token}`)
          .send({ movies: data })
          .expect(204)
  
        expect(res.body).toStrictEqual({})
  
        let after = await UserDatas.findOne({ username: userData.username })
  
        expect(after.watchList.length).toBe(before.watchList.length - data.length)
        expect(after.watchList).toEqual(expect.not.arrayContaining(data))
  
      })

    })

    describe('given one of the movie data doesn\'t exist', () => {

      it('should return 204 without any message', async () => {
  
        let before = await UserDatas.findOne({ username: userData.username })
  
        let data = ['movie4', 'movie6', 'movie7']
  
        const res = await request(app)
          .delete('/watchList')
          .set('Authorization', `Bearer ${token}`)
          .send({ movies: data })
          .expect(204)
  
        expect(res.body).toStrictEqual({})
  
        let after = await UserDatas.findOne({ username: userData.username })
  
        expect(after.watchList.length).toBe(before.watchList.length - 2)
        expect(after.watchList).toEqual(expect.not.arrayContaining(data))
  
      })

    })

  })

})