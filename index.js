var express = require ('express');
var bodyParser = require('body-parser');
var session = require('express-session');
var validator = require ('express-validator');
var path = require('path');

const expressSanitizer = require('express-sanitizer');
const app = express(); 
const port = 8080;

app.use(express.static(path.join('styling')));
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost/recipebankdb";

MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  console.log("Database created!");
  db.close();

});

///added for session management
app.use(session({
    secret: 'somerandonstuffs',
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: 600000
    }
}));
app.use(expressSanitizer());
app.use(bodyParser.urlencoded({extented:true}))
require('./routes/main')(app);
app.set('views',__dirname + '/views');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);




app.listen(port, () => console.log(`Example app listening on port ${port}!`))
