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

app.get('/hello', (req, res) =>{
  res.render('pages/index.ejs');
});

app.get('/searches/new', (req, res) =>{
  res.render('pages/searches/new.ejs');
});

app.post('/searches', (req, res) =>{
  console.log(req.body);
  res.send('hello there');
});

// function getBooks (req, res) {
  
// }

function Book(obj) {
  this.image = obj.imageLinks.small || 'https://i.imgur.com/J5LVHEL.jpg';
  this.title = obj.volumeInfo.title || 'no title';
  this.author = obj.volumeInfo.authors || 'no author';
  this.description = obj.volumeInfo.description || 'no description';
}
// start the app
app.listen(PORT, () => console.log(`App is up on PORT:  ${PORT}`));
