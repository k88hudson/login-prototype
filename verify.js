var express = require('express');
var https = require('https');
var querystring = require('querystring');
var Habitat = require('habitat');

//TODO FIX
var audience = "http://localhost:1888";

Habitat.load();

var app = express();
var env = new Habitat();
var optimize = env.get('OPTIMIZE');

app.use(express.logger('dev'));
app.use(express.compress());
app.use(express.bodyParser());

app.post('/verify', function(request, result) {

  var req = https.request({
      method: 'POST',
      host: 'verifier.login.persona.org',
      path: '/verify'
    },
    function(res) {
      var body = '';
      res.setEncoding('utf8');
      res.on('data', function(chunk) {
        body+=chunk;
        ""
      });
      res.on('end', function() {
        try {
          var verifierResp = JSON.parse(body);
          var valid = verifierResp && verifierResp.status === "okay";
          var email = valid ? verifierResp.email : null;
          if (valid) {
            console.log("assertion verified successfully for email:", email);
            result.json({
              email: email
            });
          } else {
            console.log("failed to verify assertion:", verifierResp.reason);
            result.send(verifierResp.reason, 403);
          }
        } catch (e) {
          console.log("non-JSON response from verifier");
          result.send("bogus response from verifier!", 403);
        }
      });
    });

  req.on('error', function(e) {
    console.log('problem with request: ' + e.message);
  });

  var data = querystring.stringify({
    assertion: request.body.assertion,
    audience: request.body.audience
  });

  // write data to request body
  req.setHeader('Content-Type', 'application/x-www-form-urlencoded');
  req.setHeader('Content-Length', data.length);
  req.write(data);
  req.end();
});

app.listen(env.get('VERIFY_PORT'), function() {
  console.log('Now listening on http://localhost:%d', env.get('VERIFY_PORT'));
});
