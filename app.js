const express = require("express");
const app = express();
var bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json())
const jsonfile = require('jsonfile')
const path = './test/data.json'
const file = jsonfile.readFileSync(path)

const findBookById = (id) => {
    const books = file.books
    const bookFound = books.filter((book) => {
        if (book.id === id) {
             return book
        }   
    });
    if (bookFound.length>0){
        return bookFound
    }
    return false
}

app.get('/api/book', (req, res) => {
	return res.status(200).json({
    success: "true",
    message: "books",
    books: file.books,
  });
})

app.get('/api/book/:id', (req, res) => {
	return res.status(200).json({
    success: "true",
    message: "books",
    books: file.books[req.params.id]
  });
})

app.post('/api/book', (req, res) => {
	const book = {
		id: file.books.length,
		name: req.body.name,
        author: req.body.author,
        realese: req.body.realese,
        owner: req.body.owner,
        search_tags: req.body.search_tags
	}
	jsonfile.readFile(path, (err, obj) => {
        if (err) throw err;
        let fileObj = obj;
        fileObj.books.push(book);
        jsonfile.writeFile(path, fileObj, {spaces: 2},(err) => {
          if (err) throw err;
        })
    })
	return res.status(200).json({
	    success: "true",
	    message: "book added successfully",
	    book: book,
  	});
})

app.put('/api/book/:id', (req, res) => {
	const id = parseInt(req.params.id, 10);
	const bookFound = findBookById(id);
	if (!bookFound) {
	    return res.status(404).json({
	      success: 'false',
	      message: 'user not found',
	    });
  	}
    const book = {
		id: id,
		name: req.body.name || req.body.name,
    author: req.body.author || req.body.author,
    realese: req.body.realese || req.body.realese,
    owner: req.body.owner || req.body.owner,
    search_tags: req.body.search_tags || req.body.search_tags
	}
    jsonfile.readFile(path, (err, obj) => {
        if (err) throw err;
        let fileObj = obj;
        fileObj.books[id] = book;
        jsonfile.writeFile(path, fileObj, {spaces: 2}, (err) => {
          if (err) throw err;
        })
    })
    return res.status(200).json({
	    success: "true",
	    message: "book updated successfully",
	    book: book,
  	});
})

app.delete('/api/book/:id', (req, res) => {
	const id = parseInt(req.params.id, 10);
	jsonfile.readFile(path, (err, obj) => {
        if (err) throw err;
        let fileObj = obj;
        fileObj.books.splice(id, 1);
        jsonfile.writeFile(path, fileObj, {spaces: 2}, (err) => {
          if (err) throw err;
        })
    })
    return res.status(200).json({
	    success: "true",
	    message: "book deleted successfully",
        book: file.books[id]
  	});
})

let server = app.listen(3000, () => {
	console.log("server listen to port 3000")
})

module.exports = server;