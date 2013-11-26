define(['eventEmitter/EventEmitter'], function(EventEmitter) {
  var ee = new EventEmitter();

  return function(options) {
    var self = this;

    options = options || {};

    // First, check if navigator.id exists
    if (!navigator.id) {
      console.error('Looks like navigator.id does not exist. Did you include https://login.persona.org/include.js?');
    }

    self.email = options.email || '';
    self.loginRoute = options.loginRoute || '/verify';
    self.logoutRoute = options.logoutRoute || '/logout';

    // Set up watch methods
    navigator.id.watch({
      loggedInUser: options.email,
      onlogin: function(assertion) {
        // var xhr = new XMLHttpRequest();
        // xhr.open('POST', self.loginRoute, true);
        // xhr.setRequestHeader('Content-Type', 'application/json');
        // //xhr.setRequestHeader('X-CSRF-Token', _csrf);
        // xhr.addEventListener('loadend', function(e) {
        //   var data = JSON.parse(this.responseText);
        //   console.log(data);
        //   if (data && data.status === 'okay') {
        //     ee.emitEvent('login', [assertion]);
        //   }
        // }, false);

        // xhr.send(JSON.stringify({
        //   assertion: assertion
        // }));
        ee.emitEvent('login', [assertion]);
      },
      onlogout: function() {
        // var xhr = new XMLHttpRequest();
        // xhr.open('POST', self.logoutRoute, true);
        // xhr.setRequestHeader('X-CSRF-Token', _csrf);
        // xhr.addEventListener('loadend', function(e) {
        //   ee.emitEvent('logout');
        // });
        // xhr.send();
        ee.emitEvent('logout');
      }
    });

    // Login
    self.login = function() {
      ee.emitEvent('progress');
      navigator.id.request({
        oncancel: function() {
          console.log('cancel');
          ee.emitEvent('error', [{
            error: 'The user canceled the request.'
          }]);
        }
      });
    };

    // Logout
    self.logout = function() {
      navigator.id.logout();
    };

    // Add/remove event listeners
    self.on = function(event, callback) {
      ee.addListener(event, callback);
    };
    self.off = function(event, callback) {
      ee.removeListener(event, callback);
    };

  };
});
