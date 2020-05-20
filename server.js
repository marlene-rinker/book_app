'use strict';

//packages
const express = require('express');
const superagent = require('superagent');
require('dotenv').config();


const app = express();
const PORT = process.env.PORT || 3000;

//set up app

app.use(express.static('./public'));
app.set('view engine', 'ejs');
app.use(express.urlencoded( {extended: true}));

//set up pg
const client = require('./modules/pg_client.js');

app.get('/', getStoredBooks);

app.get('/hello', (req, res) =>{
  res.render('pages/index.ejs');
});

app.get('/searches/new', (req, res) =>{
  res.render('pages/searches/new.ejs');
});

app.get('/errors', (req, res) =>{
  res.render('pages/errors.ejs');
});

app.post('/searches', getBooks);

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

function Book(obj) {
  this.image = 'https://www.freeiconspng.com/uploads/book-icon--icon-search-engine-6.png';
  if (obj.volumeInfo.imageLinks && obj.volumeInfo.imageLinks.thumbnail) {
    this.image = obj.volumeInfo.imageLinks.thumbnail;
    if(this.image.match('^http:')){
      this.image = this.image.replace('http:','https:');
    }
  }
  this.title = obj.volumeInfo.title || 'no title';
  this.author = obj.volumeInfo.authors || ['no author'];
  this.description = obj.volumeInfo.description || 'no description';
}
// start the app
app.listen(PORT, () => console.log(`App is up on PORT:  ${PORT}`));
