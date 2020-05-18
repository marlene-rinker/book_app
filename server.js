'use strict';

//packages
const express = require('express');
const superagent = require('superagent');


const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('./public'));

app.set('view engine', 'ejs');

// if we use forms this is needed
// app.use(express.urlencoded( {extended: true}));

app.get('/hello', (req, res) =>{
  res.render('pages/index.ejs');
});


// start the app
app.listen(PORT, () => console.log(`App is up on PORT:  ${PORT}`));
