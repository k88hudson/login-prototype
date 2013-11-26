var express = require('express');
var http = require('http');
var Habitat = require('habitat');
var nunjucks = require('nunjucks');
var routes = require('./routes')();
var querystring = require('querystring');

Habitat.load();

var app = express();
var env = new Habitat();
var optimize = env.get('OPTIMIZE');
var webmakerLogin = {
  verify: function(req, res) {

    var post = http.request({
      method: 'POST',
      host: 'localhost',
      path: 'verify',
      port: env.get('VERIFY_PORT')
    }, function(data) {
      data.on('data', function(d) {
        console.log(d);
      });
    });

    post.end();

    post.on('error', function(e) {
      console.error(e);
    });

  },
  logout: function(req, res) {
    return res.send('Logged out');
  }
};

var nunjucksEnv = new nunjucks.Environment(new nunjucks.FileSystemLoader(__dirname + '/src'), {
  autoescape: true
});
var cacheSettings = optimize ? {
  maxAge: '31556952000'
} : undefined; // one year;

app.locals({
  OPTIMIZE: env.get('OPTIMIZE')
});

nunjucksEnv.express(app);

app.use(express.logger('dev'));
app.use(express.compress());
app.use(express.bodyParser());
app.use(express.static(__dirname + '/dist', cacheSettings));
app.use(express.static(__dirname + '/public', cacheSettings));
app.use('/bower_components', express.static(__dirname + '/bower_components', cacheSettings));

app.use(app.router);

app.get('/', routes.index);
app.post('/verify', function(request, result) {
  var req = http.request({
      method: 'POST',
      host: 'localhost',
      path: '/verify',
      port: env.get('VERIFY_PORT')
    },
    function(res) {
      var body = '';
      console.log('STATUS: ' + res.statusCode);
      console.log('HEADERS: ' + JSON.stringify(res.headers));
      res.setEncoding('utf8');
      res.on('data', function(chunk) {
        body+=chunk;
      });
      res.on('end', function() {
        var verifierResp = JSON.parse(body);
        console.log(verifierResp);
        result.send(verifierResp);
      });
    });

  req.on('error', function(e) {
    console.log('problem with request: ' + e.message);
  });

  var data = querystring.stringify({
    assertion: request.body.assertion,
    audience: 'http://localhost:1989'
  });

  // write data to request body
  req.setHeader('Content-Type', 'application/x-www-form-urlencoded');
  req.setHeader('Content-Length', data.length);
  req.write(data);
  req.end();
});

app.get('/logout', webmakerLogin.logout);

app.listen(env.get('PORT'), function() {
  console.log('Now listening on http://localhost:%d', env.get('PORT'));
});
