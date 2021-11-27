const path = require('path');

// init project
const express = require('express');
const app = express();

app.use(express.static('public'));
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// http://expressjs.com/en/starter/basic-routing.html
app.get('/', function(request, response) {
  response.render('index');
});

app.get('/projects', function(request, response) {
  response.render('code');
});

app.get('/about', function(request, response) {
  response.render('about');   
});

// listen for requests :)
const listener = app.listen(8080, 'localhost', function(){
  console.log("Server is listening on port 8080");
});
