const request = require('supertest')
const jwt = require('jsonwebtoken')
const app = require('../app.js')
const mongoose = require('mongoose')

beforeAll(() => {

  mongoose.connect(process.env['MONGO_URI'], () => {
    console.log('MongoDB connection established')
  })

})

afterAll(async () => {

  await mongoose.disconnect()
  console.log('MongoDB connection refused')

})

describe('/passwordReset endpoint', () => {

  const userData = { username: 'test123' }

  let tokenExp = 60
  let token = jwt.sign({ username: userData.username, exp: Date.now() + tokenExp }, process.env['SECRET'])

  describe('put /passwordReset', () => {

    it('should return 200, message, and password should be changed', async () => {

      await request(app)
        .post('/auth/login')
        .send({
          username: 'test123',
          password: '1234567890'
        })
        .expect(200)

      const newPassword = 'HaloHaloBandung'

      await request(app)
        .put('/passwordReset')
        .send({ newPassword, token })
        .expect(200)

      await request(app)
        .post('/auth/login')
        .send({
          username: 'test123',
          password: '1234567890'
        })
        .expect(401)

      await request(app)
        .post('/auth/login')
        .send({
          username: 'test123',
          password: newPassword
        })
        .expect(200)

    })

  })

})