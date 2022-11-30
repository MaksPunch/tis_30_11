const app = require('../../../app.js')
const request = require('supertest')
const expect = require('expect').default
const jsonfile = require('jsonfile')

const file = jsonfile.readFileSync('data.json')

describe('GET /book', function() {
    it('should return a json of 665 characters', function(done) {
      request(app).get('/api/book')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect('Content-Length', '665')
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
            })
            console.log(file.books.find((val) => val == book))
    })
})