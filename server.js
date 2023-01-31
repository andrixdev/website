var express = require('express');
var app = express();
var path = require('path');

app.use(express.static(__dirname + "/"));
app.get('/', (req, res) => {
    res.render('index.html')
})
app.get('/films', (req, res) => res.redirect('/'))
app.get('/gallery', (req, res) => res.redirect('/'))
app.get('/more', (req, res) => res.redirect('/'))
app.get('/about', (req, res) => res.redirect('/'))
app.get('/contact', (req, res) => res.redirect('/'))

app.listen(8080);