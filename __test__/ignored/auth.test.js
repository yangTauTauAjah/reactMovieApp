const request = require('supertest');
const jwt = require('jsonwebtoken')
const app = require('../../app.js')
const mongoose = require('mongoose')
const { parseCookie } = require('../../functions/functions.js')

const { UserCredential, UserDatas } = require('../../database.js')

beforeAll(() => {

  mongoose.connect(process.env['MONGO_URI'], () => {
    console.log('MongoDB connection established')
  })

})

afterAll(async () => {

  await mongoose.disconnect()
  console.log('MongoDB connection refused')

})


describe('/auth endpoint', () => {

  describe('post /auth/register', () => {

    describe("given one of the field is not filled or email is not valid", () => {

      it ('should return 422 with message', async () => {

        {
          let res = await request(app)
            .post('/auth/register')
            .send({
              username: '',
              email: 'test123@example.com',
              password: '1234567'
            })
            .expect(422)

          expect(res.body.message).toBe('Please provide valid username and password')
        }

        {
          let res = await request(app)
            .post('/auth/register')
            .send({
              username: 'test123',
              email: 'test123@example.com',
              password: ''
            })
            .expect(422)

          expect(res.body.message).toBe('Please provide valid username and password')
        }

        {
          let res = await request(app)
          .post('/auth/register')
          .send({
            username: 'test123',
            email: 'test123',
            password: '1234567'
          })
          .expect(422)

          expect(res.body.message).toBe('Please provide valid email')
          
        }
        

      })

    })

    describe('given username is not registered', () => {

      it( 'should return 200', async () => {

        const body = {
          username: 'test123',
          email: 'test123@example.com',
          password: '1234567890'
        }

        await UserCredential.findOneAndDelete({username: body.username}).exec()
        await UserDatas.findOneAndDelete({username: body.username}).exec()

        const res = await request(app)
          .post('/auth/register')
          .send(body)
          .expect(200)

        expect(res.body).toStrictEqual(expect.objectContaining({
          message: 'User succesfully registered',
          data: {
            username: body.username,
            email: body.email
          }
        }))

      })

    })

    describe('given username already registered', () => {

      it( 'should return 409', async () => {

        const body = {
          username: 'test123',
          email: 'johndoe@example.com',
          password: '1234567890'
        }

        const res = await request(app)
          .post('/auth/register')
          .send(body)
          .expect(409)

        expect(res.body.message).toBe('Username already registered')

      })

    })

  })

  describe('post /auth/login', () => {

    describe("given the user is not registered", () => {

      it("should return 404 with message", async () => {

        const body = {
          username: 'ThisIsNotRegistered',
          password: '1234567890'
        }

        const res = await request(app)
          .post('/auth/login')
          .send(body)
          .expect(404)

        expect(res.body.message).toBe("User is not registered yet, please create a new one")

      })

    })

    describe("given the credetial doesn't match", () => {

      it('should return 401 with message', async () => {

        const body = {
          username: 'test123',
          password: '123456'
        }

        const res = await request(app)
          .post('/auth/login')
          .send(body)
          .expect(401)

        expect(res.body.message).toBe("Username and password doesn't match")

      })

    })

    describe("given the credetial does match", () => {

      it('should return 200, cookies with 5 days of expiration, and message', async () => {

        const body = {
          username: 'test123',
          password: '1234567890'
        }

        const res = await request(app)
          .post('/auth/login')
          .send(body)
          .expect(200)

        expect(res.body)
        .toStrictEqual(expect.objectContaining({
          message: "Login successful",
          data: {
            sid: expect.any(String),
            username: body.username
          }
        }))

        const cookie = parseCookie(res.get('Set-Cookie')[0])

        expect(cookie['Max-Age']/(60*60*24)).toBeCloseTo(5)
        expect(jwt.verify(cookie['sid'], process.env['SECRET']).exp)
        .toBeGreaterThan(Date.now())

      })

    })

  })

  describe('get /auth/index', () => {

    describe("user doesn't provide auth header", () => {
      
      it("should return 401, and authorized false", async () => {
  
        await request(app)
          .get('/auth')
          .expect(401)
          .expect('X-Session-Expired', 'false')
          .expect('X-User-Authorized', 'false')

      })

    })

    describe('user provide expired or invalid token', () => {

      it('should return 401, session expired, and authorized false', async () => {
      
        await request(app)
          .get('/auth')
          .set('Authorization', '1234567890')
          .expect(401)
          .expect('X-Session-Expired', 'true')
          .expect('X-User-Authorized', 'false')

        await request(app)
          .get('/auth')
          .set('Authorization', 'Bearer16771hjfisaf')
          .expect(401)
          .expect('X-Session-Expired', 'true')
          .expect('X-User-Authorized', 'false')

        await request(app)
          .get('/auth')
          .set('Authorization', 'bearer 1234')
          .expect(401)
          .expect('X-Session-Expired', 'true')
          .expect('X-User-Authorized', 'false')

        /* invalid token */

        let tokenExp = 60*60*24
        let token = jwt.sign({somethingElse: 'JohnDoe', exp: Date.now() + tokenExp }, process.env['SECRET'])

        await request(app)
          .get('/auth')
          .set('Authorization', `Bearer ${token}`)
          .expect(401)
          .expect('X-Session-Expired', 'false')
          .expect('X-User-Authorized', 'false')

        tokenExp = 60*60*24
        token = jwt.sign({username: 'JohnDoe', expired: Date.now() + tokenExp }, process.env['SECRET'])

        await request(app)
          .get('/auth')
          .set('Authorization', `Bearer ${token}`)
          .expect(401)
          .expect('X-Session-Expired', 'false')
          .expect('X-User-Authorized', 'false')

        /* expired token */

        tokenExp = -(60*60*24)
        token = jwt.sign({username: 'JohnDoe', exp: Date.now() + tokenExp }, process.env['SECRET'])

        await request(app)
          .get('/auth')
          .set('Authorization', `Bearer ${token}`)
          .expect(401)
          .expect('X-Session-Expired', 'true')
          .expect('X-User-Authorized', 'false')

      })

    })

    describe('user provide valid auth bearer token', () => {

      it('should return 200 and cookies with renewed session id', async () => {

        const tokenExp = 60*60*24
        const token = jwt.sign({username: 'JohnDoe', exp: Date.now() + tokenExp }, process.env['SECRET'])

        let res = await request(app)
          .get('/auth')
          .set('Authorization', `Bearer ${token}`)
          .expect(200)

        expect(res.get('X-Session-Expired')).toEqual('false')
        expect(res.get('X-User-Authorized')).toEqual('true')

        const cookie = parseCookie(res.get('Set-Cookie')[0])
        expect(jwt.verify(cookie['sid'], process.env['SECRET']).exp)
        .toBeGreaterThan(Date.now() + 60*60*24*4.8)

      })

    })

  })

  describe('delete /auth/logout', () => {

    describe('user attempting to log out', () => {

      it("should return 200 with message", async () => {
  
        const res = await request(app)
          .delete('/auth/logout')
          .expect(200)
  
        expect(res.body.message).toBe('Logged out')
  
      })

    })

    describe('user attempting to access resource', () => {

      it('should return 401 and message', async () => {

        const res = await request(app)
          .get('/')
          .expect(401)

        expect(res.get('X-Session-Expired')).toBe('false')
        expect(res.get('X-User-Authorized')).toBe('false')
        expect(res.body.message).toBe('Please provide token')

      })

    })

  })

})