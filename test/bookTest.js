const app = require('../app.js')
const request = require('supertest')
const expect = require('expect').default
const jsonfile = require('jsonfile')
const path = require('path')

let filePath = path.join(__dirname+'/data.json')
const file = jsonfile.readFileSync(filePath)

describe('GET /book', function() {
    it('get', function(done) {
      request(app).get('/api/book')
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