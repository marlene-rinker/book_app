'use strict';

//packages
const express = require('express');
const superagent = require('superagent');


const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('./public'));

app.set('view engine', 'ejs');

// if we use forms this is needed
app.use(express.urlencoded( {extended: true}));

// app.get('/', (req, res) =>{
//   res.render('pages/index.ejs');
// });

app.get('/hello', (req, res) =>{
  res.render('pages/index.ejs');
});

app.get('/searches/new', (req, res) =>{
  res.render('pages/searches/new.ejs');
});

app.post('/searches', (req, res) =>{
  console.log(req.body);
  // res.send('hello there');
  getBooks(req, res);
});

function getBooks (req, res) {
  const url ='https://www.googleapis.com/books/v1/volumes';

  const queryForSuper = {
    q: req.body.search[0],
    maxResults: 10
  };
  // console.log(`this is the query: ${req.body.search[0]}`);

  superagent.get(url)
    .query(queryForSuper)
    .then(resultFromSuper => {
      // console.log(resultFromSuper.body.items[0].volumeInfo);

      const search_results = resultFromSuper.body.items;
      const bookResults = [];

      for (let i = 0; i < search_results.length; i++) {
        console.log(`this is search_results ${i}` ,search_results[i]);
        bookResults.push(new Book(search_results[i]));
      }
      console.log(bookResults);
      // res.send(bookResults).status(200);
      res.render('pages/searches/show',{arrayOfBooks : bookResults});
    })
    .catch(error => {
      console.log(error);
      res.send(error).status(500);
    });

}


function Book(obj) {
  console.log(obj);
  this.image = 'https://www.freeiconspng.com/uploads/book-icon--icon-search-engine-6.png';
  if (obj.volumeInfo.imageLinks && obj.volumeInfo.imageLinks.thumbnail) {
    this.image = obj.volumeInfo.imageLinks.thumbnail;
  }
  // this.image = 'https://www.freeiconspng.com/uploads/book-icon--icon-search-engine-6.png';
  this.title = obj.volumeInfo.title || 'no title';
  this.author = obj.volumeInfo.authors[0] || 'no author';
  this.description = obj.volumeInfo.description || 'no description';
}
// start the app
app.listen(PORT, () => console.log(`App is up on PORT:  ${PORT}`));
