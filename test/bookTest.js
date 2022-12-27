const app = require('../app.js')
const request = require('supertest')
const expect = require('expect').default
const jf = require('jsonfile')
const path = require('path')
var cookies;

let filePath = path.join(__dirname+'/data.json')
const file = jf.readFileSync(filePath)

describe('AUTH required', () => {
    it('login', () => {
        return request(app).post('/api/login')
            .send({
                "username": "3",
                "password": "12345678Aa-"
            })
            .expect(200)
            .then(res => {
                cookies = res.headers['set-cookie'].pop().split(';')[0];
            })
    })
})

describe('GET /book', function() {
    it('get all books', function(done) {
      request(app).get('/api/book')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function(err, res) {
          if (err) throw err;
          done();
        });
    });
    it('get book with id 1', function(done) {
        request(app).get('/api/book/1')
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function(err, res) {
            if (err) throw err;
            done();
          });
      });
});

describe('POST /book', () => {
    it('should post a new book', (done) => {
        let book = {
            id: file.books.length,
            name: "req.body.name",
            author: "req.body.author",
            realese: "req.body.realese",
            owner: "req.body.owner",
            search_tags: "req.body.search_tags"
        }
        request(app)
            .post('/api/book')
            .send(book)
            .expect(200)
            .expect((res) => {
                expect(res.body.book).toStrictEqual(book)
            })
            .end((err, res) => {
                if (err) return done(err)
                done()
            })
    })
})

describe('PUT /book/:id', () => {
    it('should update a book', (done) => {
        let book = {
            id: 1,
            "name": "Под шепчущей дверью",
            "author": "Ти Джей Клун",
            "realese": "2022",
            "owner": [
                {
                    "id": 69,
                    "name": "Дмитрий Фролов",
                    "datein": "22.12.2022",
                    "dateout": "23.12.2022"
                }
            ],
            "search_tags": [
                "Фентези",
                "Ужасы"
            ] 
        }
        request(app)
            .put('/api/book/1')
            .send(book)
            .expect(200)
            .expect((res) => {
                expect(res.body.book).toStrictEqual(book)
            })
            .end((err, res) => {
                if (err) return done(err)
                done()
            })
    })
})

describe('POST Auth', () => {
    it('should create valid refreshToken for logged user', (done) => {
        let user = {
            username: "dima",
            password: "123456"
        }
        request(app)
            .post('/api/login')
            .send(user)
            .expect(200)
            .expect((res) => {
                jf.readFile('./models/UserToken.json', (err, obj) => {
                    if (err) throw err
                    expect(res.body.refreshToken).toStrictEqual(obj.userToken.find(el => el.userId == res.body.userId).token)
                })
            })
            .end((err, res) => {
                if (err) return done(err)
                done()
            })
    }),
    it('should create a new user', (done) => {
        let user = {
            username: "aaaaa",
            email: "aaaaa@gmail.com",
            password: "123456"
        }
        request(app)
            .post('/api/signUp')
            .send(user)
            .expect(201)
            .expect((res) => {
                jf.readFile('./models/user.json', (err, obj) => {
                    if (err) throw err
                    const fileObj = obj;
                    fileObj.users.splice(fileObj.users.findIndex(el => el.username == "aaaaa"), 1)
                    jf.writeFile('./models/user.json', fileObj, {spaces: 2}, (err) => {if (err) throw err})
                })
                expect(res.body.message).toStrictEqual("Account created sucessfully")
            })
            .end((err, res) => {
                if (err) return done(err)
                done()
            })
            
    }),
    it('should return error if email is already taken', (done) => {
        let user = {
            username: "kolya",
            email: "stariyperets@gmail.com",
            password: "123456"
        }
        request(app)
            .post('/api/signUp')
            .send(user)
            .expect(400)
            .expect((res) => {
                expect(res.body.message).toStrictEqual("User with given email already exist")
            })
            .end((err, res) => {
                if (err) return done(err)
                done()
            })
    })
    it('should login successfully', (done) => {
        let user = {
            username: "dima",
            password: "123456"
        }
        request(app)
            .post('/api/login')
            .send(user)
            .expect(200)
            .expect((res) => {
                expect(res.body.message).toStrictEqual("Logged in sucessfully")
            })
            .end((err, res) => {
                if (err) return done(err)
                done()
            })
    })
})

describe('DELETE /book/:id', () => {
    it('should delete a book', (done) => {
        request(app)
            .delete('/api/book/1')
            .expect(200)
            .expect((res) => {
                expect(res.body.book).toStrictEqual(file.books.find(el => el.id == 1))
                jf.writeFile(filePath, file, {spaces: 2}, (err) => {
                    if (err) throw err
                })
            })
            .end((err, res) => {
                if (err) return done(err)
                done()
            })
    })
})

describe('refreshToken routes', () => {
    it('should logout successfully WITH cookies', (done) => {
        request(app).delete('/api/refreshToken/logout')
            .set('cookie', cookies)
            .expect(200)
            .expect(res => {
                expect(res.body.message).toStrictEqual('Logged Out Sucessfully')
            })
            .end((err, res) => {
                if (err) return done(err)
                done()
            })
    })
    it('should create new access token', (done) => {
        request(app).post('/api/refreshToken')
            .set('cookie', cookies)
            .expect(200)
            .expect((res) => {
                expect(res.body.message).toStrictEqual('Access token created successfully')
            })
            .end((err, res) => {
                if (err) return done(err)
                done()
            })
    }) 
})

