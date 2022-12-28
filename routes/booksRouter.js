const { Router } = require("express");
require("dotenv").config();
const auth = require('../middleware/auth.js');
const jf = require('jsonfile')
const path = './test/data.json'
const file = jf.readFileSync(path)

const router = Router();

Date.prototype.addDays = function(days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
}

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

router.get('/', (req, res) => {
	return res.status(200).json({
    success: "true",
    message: "books",
    books: file.books,
  });
})

router.get('/:id', (req, res) => {
	return res.status(200).json({
    success: "true",
    message: "books",
    books: file.books[req.params.id]
  });
})

router.post('/', auth, (req, res) => {
    let now = new Date()
    const dateout = now.addDays(5)
    const owner = {
        id: req.user.id,
        name: req.user.name,
        datein: `${now.getDay().toString().padStart(2, '0')}.${(now.getMonth()+1).toString().padStart(2, '0')}.${now.getFullYear()}`,
        dateout: `${dateout.getDay().toString().padStart(2, '0')}.${(dateout.getMonth()+1).toString().padStart(2, '0')}.${dateout.getFullYear()}`
    }
	const book = {
		id: file.books.length,
		name: req.body.name,
        author: req.body.author,
        realese: req.body.realese,
        owner: owner,
        search_tags: req.body.search_tags
	}
	jf.readFile(path, (err, obj) => {
        if (err) throw err;
        let fileObj = obj;
        fileObj.books.push(book);
        jf.writeFile(path, fileObj, {spaces: 2},(err) => {
          if (err) throw err;
        })
    })
	return res.status(200).json({
	    success: "true",
	    message: "book added successfully",
	    book: book,
  	});
})

router.put('/:id', auth, (req, res) => {
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
    jf.readFile(path, (err, obj) => {
        if (err) throw err;
        let fileObj = obj;
        fileObj.books[id] = book;
        jf.writeFile(path, fileObj, {spaces: 2}, (err) => {
          if (err) throw err;
        })
    })
    return res.status(200).json({
	    success: "true",
	    message: "book updated successfully",
	    book: book,
  	});
})

router.delete('/:id', auth, (req, res) => {
    if (req.user.roles != "admin") return res.status(403).send('Not Admin')
	const id = parseInt(req.params.id, 10);
	jf.readFile(path, (err, obj) => {
        if (err) throw err;
        let fileObj = obj;
        fileObj.books.splice(id, 1);
        jf.writeFile(path, fileObj, {spaces: 2}, (err) => {
          if (err) throw err;
        })
    })
    return res.status(200).json({
	    success: "true",
	    message: "book deleted successfully",
      book: file.books[id]
  	});
})

module.exports = router;