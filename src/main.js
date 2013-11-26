requirejs.config({
  baseUrl: '../bower_components',
  paths: {
    main: '../src/main',
    nunjucks: 'nunjucks/browser/nunjucks',
    templates: '../templates',
    jquery: 'jquery/jquery',
    persona: '../webmaker-login'
  }
});

require([
  'jquery',
  'persona'

], function (
  $,
  Persona
){

  var persona = new Persona();

  $('.login').on('click', function() {
    persona.login();
  });

  $('.logout').on('click', function() {
    persona.logout();
  });

  persona.on('progress', function() {
    console.log('in progress...');
  });

  persona.on('login', function(assert) {
    console.log(assert);
  });

  persona.on('logout', function() {
    console.log('logged out');
  });

  persona.on('error', function(err) {
    console.log(err);
  });


});
