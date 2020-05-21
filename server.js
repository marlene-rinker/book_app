'use strict';

//packages
require('dotenv').config();
const express = require('express');
const superagent = require('superagent');
const methodOverride = require('method-override')



const app = express();
const PORT = process.env.PORT || 3000;

//set up app

app.use(express.static('./public'));
app.set('view engine', 'ejs');
app.use(express.urlencoded( {extended: true}));
app.use(methodOverride('_overrideMethod'));

//set up pg
const client = require('./modules/pg_client.js');

// routes
app.get('/', getStoredBooks);
app.get('/books/:id', requestBook);
app.post('/books', addBook);
app.put('/books/:id', updateBook);


app.get('/searches/new', displaySearchPage);
app.post('/searches', getBooks);

app.get('/errors', displayErrorsPage);


// functions

function getBooks (req, res) {
  const url ='https://www.googleapis.com/books/v1/volumes';
  let search_query = req.body.search[0];
  if(req.body.search[1] === 'title'){
    search_query = `intitle: ${req.body.search[0]}`;
  }
  if(req.body.search[1] === 'author'){
    search_query = `inauthor: ${req.body.search[0]}`;
  }

  const queryForSuper = {
    q: search_query,
    maxResults: 10
  };
  superagent.get(url)
    .query(queryForSuper)
    .then(resultFromSuper => {


      const search_results = resultFromSuper.body.items;
      const bookResults = [];

      for (let i = 0; i < search_results.length; i++) {
        // console.log(`this is search_results ${i}` ,search_results[i]);
        bookResults.push(new Book(search_results[i]));
      }
      // console.log(bookResults);
      res.render('pages/searches/show',{arrayOfBooks : bookResults});
    })
    .catch(error => {
      console.log(error);
      // res.send(error).status(500);
      res.render('pages/errors',{errorMessage : error});
    });

}

function displaySearchPage (req, res) {
  res.render('pages/searches/new.ejs');
}

function displayErrorsPage (req, res) {
  res.render('pages/errors.ejs');
}

function getStoredBooks(req, res){
  const sqlQuery = 'SELECT * FROM books';
  client.query(sqlQuery)
    .then(resultFromSql => {
      if(resultFromSql.rowCount > 0){
        res.render('pages/index',{booksArray : resultFromSql.rows, rowCount : resultFromSql.rowCount});
      }else {
        res.redirect('searches/new');
      }
    })
}

function requestBook(req, res){

  client.query('SELECT * FROM books WHERE id=$1', [req.params.id])
    .then(dataFromSql => {
      res.render('pages/books/show', {bookRequested: dataFromSql.rows[0]});
    });
}

function addBook(req, res){
  // run SELECT from table, check if matches something, then run or not (if want to only add if not there)
  const sqlQuery = 'INSERT INTO books (author, title, isbn, image, description, bookshelf) VALUES ($1, $2, $3, $4, $5, $6)';
  const sqlValues = [req.body.author, req.body.title, req.body.isbn, req.body.image, req.body.description, req.body.bookshelf];
  client.query(sqlQuery, sqlValues)
  client.query('SELECT * FROM books WHERE isbn=$1', [req.body.isbn])
    .then(dataFromSql => {
      res.redirect(`/books/${dataFromSql.rows[0].id}`)
    })
}

function updateBook(req, res) {
  console.log('request on a PUT route : success');
  console.log('req.params', req.params);
  const sqlQuery = `
    UPDATE books 
    SET author=$2, title=$3, isbn=$4, image=$5, description=$6, bookshelf=$7
    WHERE id=$1
  `;
  const sqlValues = [req.params.id, req.body.author, req.body.title, req.body.isbn, req.body.image, req.body.description, req.body.bookshelf];
  client.query(sqlQuery, sqlValues)
    .then(() => {
      res.redirect(`/books/${req.params.id}`)
    })
    .catch(error => {
      console.log(error);
      // res.send(error).status(500);
      res.render('pages/errors',{errorMessage : error});
    });
}

function Book(obj) {
  this.image = 'https://www.freeiconspng.com/uploads/book-icon--icon-search-engine-6.png';
  if (obj.volumeInfo.imageLinks && obj.volumeInfo.imageLinks.thumbnail) {
    this.image = obj.volumeInfo.imageLinks.thumbnail;
    if(this.image.match('^http:')){
      this.image = this.image.replace('http:','https:');
    }
  }
  this.title = obj.volumeInfo.title || 'no title';
  this.author = obj.volumeInfo.authors[0] || ['no author'];
  this.description = obj.volumeInfo.description || 'no description';
  this.isbn = obj.volumeInfo.industryIdentifiers[0].identifier || 'no ISBN';
  this.bookshelf = 'no bookshelf';
}
// start the app
app.listen(PORT, () => console.log(`App is up on PORT:  ${PORT}`));
