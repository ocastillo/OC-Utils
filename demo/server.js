var express = require('express');

var app = express();

app.use(express.static('./public'));
app.use(express.bodyParser());

app.get('/', function(req, res) {
    console.log('root route');
    res.send('root route');
});

app.get('/app*', function(req, res) {
    console.log('app route');
    res.sendfile('public/app.html');
});

app.post('/testpost', function(req, res) {
    console.log(req.body);
    res.send('done');
});

app.listen(3000);
console.log('server started on port 3000');