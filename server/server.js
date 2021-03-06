var loopback = require('loopback');
var boot = require('loopback-boot');
var bodyParser = require('body-parser');
var app = module.exports = loopback();
var path = require('path');
app.use(loopback.static(path.resolve(__dirname, '../client')));
app.use(bodyParser.json());
// Passport configurators..
var loopbackPassport = require('loopback-component-passport');
var PassportConfigurator = loopbackPassport.PassportConfigurator;
var passportConfigurator = new PassportConfigurator(app);
/*
 * body-parser is a piece of express middleware that
 * reads a form's input and stores it as a javascript
 * object accessible through `req.body`
 *
 */
var bodyParser = require('body-parser');
/**
 * Flash messages for passport
 *
 * Setting the failureFlash option to true instructs Passport to flash an
 * error message using the message given by the strategy's verify callback,
 * if any. This is often the best approach, because the verify callback
 * can make the most accurate determination of why authentication failed.
 */
var flash = require('express-flash');
// attempt to build the providers/passport config
var config = {};
try {
  config = require('./providers.json');
} catch (err) {
  console.trace(err);
  process.exit(1); // fatal
}



// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.
boot(app, __dirname);

// to support JSON-encoded bodies
app.use(bodyParser.json());
// to support URL-encoded bodies
app.use(bodyParser.urlencoded({
  extended: true
}));

// The access token is only available after boot
app.use(loopback.token({
  model: app.models.accessToken
}));
app.use(loopback.cookieParser(app.get('cookieSecret')));
app.use(loopback.session({
  secret: 'kitty',
  saveUninitialized: true,
  resave: true
}));
passportConfigurator.init();

// We need flash messages to see passport errors
app.use(flash());
passportConfigurator.setupModels({
  userModel: app.models.user,
  userIdentityModel: app.models.userIdentity,
  userCredentialModel: app.models.userCredential
});
for (var s in config) {
  var c = config[s];
  c.session = c.session !== false;
  passportConfigurator.configureProvider(s, c);
}
var ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn;

// Your own super cool function
var logger = function(req, res, next) {
    next(); // Passing the request to the next handler in the stack.
}

app.use(logger); // Here you add your logger to the stack.



app.start = function() {
  // start the web server
  return app.listen(function() {
    app.emit('started');
    console.log('Web server listening at: %s', app.get('url'));
  });
};

// start the server if `$ node server.js`
if (require.main === module) {
  app.start();
}
