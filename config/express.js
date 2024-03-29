
/**
 * Module dependencies.
 */

var express = require('express')
  , cookieParser = require('cookie-parser')
  , expressSession = require('express-session')
  , compression = require('compression')
  , mongoStore = require('connect-mongo')(expressSession)
  , flash = require('connect-flash')
  , helpers = require('view-helpers')
  , pkg = require('../package.json')
  , bodyParser = require('body-parser')
  , morgan  = require('morgan')
  , methodOverride = require('method-override')

module.exports = function (app, config, passport) {

  app.set('showStackError', true)

  // should be placed before express.static
  app.use(compression({
    filter: function (req, res) {
      return /json|text|javascript|css/.test(res.getHeader('Content-Type'))
    },
    level: 9
  }))

  //app.use(express.favicon())
  app.use(express.static(config.root + '/public'))

  // don't use logger for test env
  if (process.env.NODE_ENV !== 'test') {
    app.use(morgan())
  }

  // set views path, template engine and default layout
  app.set('views', config.root + '/app/views')
  app.set('view engine', 'jade')

  
    // expose package.json to views
    app.use(function (req, res, next) {
      res.locals.pkg = pkg
      next()
    })

    // cookieParser should be above session
    //app.use(cookieParser)

    // bodyParser should be above methodOverride
    //app.use(express.bodyParser())
    // parse application/x-www-form-urlencoded
	app.use(bodyParser())

	// parse application/json
	//app.use(bodyParser.json())
    
    //app.use(methodOverride('X-HTTP-Method-Override'))

    // express/mongo session storage
    // /
    
    app.use(expressSession({
      secret: 'noobjs',
      cookie: { maxAge: 3600000 },
      store: new mongoStore({
        url: config.db,
        collection : 'sessions',
        clear_interval: 3600,
      })
    }))
    

    // use passport session
    app.use(passport.initialize())
    app.use(passport.session())

    // connect flash for flash messages - should be declared after sessions
    app.use(flash())

    // should be declared after session and flash
    app.use(helpers(pkg.name))

    // adds CSRF support
    //if (process.env.NODE_ENV !== 'test') {
      //disable csrf support to allow posting from rest client (ajax)
      //app.use(express.csrf())

      // This could be moved to view-helpers :-)
      //app.use(function(req, res, next){
      //  console.log('check the csrf...', req.url);
      //  res.locals.csrf_token = req.csrfToken()
        //res.cookie('XSRF-TOKEN', res.locals.csrf_token);
      //  next()
      //})
    //}

    // routes should be at the last
    //app.use(app.router)

    // assume "not found" in the error msgs
    // is a 404. this is somewhat silly, but
    // valid, you can do whatever you like, set
    // properties, use instanceof etc.
   
    app.use(function(err, req, res, next){
      // treat as 404
      console.log("404")
      if (err.message
        && (~err.message.indexOf('not found')
        || (~err.message.indexOf('Cast to ObjectId failed')))) {
        return next()
      }

      // log it
      // send emails if you want
      console.error(err.stack)

      // error page
      res.status(500).render('500', { error: err.stack })
    })

    // assume 404 since no middleware responded
    //app.use(function(req, res, next){
      //  console.log('oops')
      //res.status(404).render('404', {
      //  url: req.originalUrl,
      //  error: 'Not found'
      //})
    //})
    
  

  // development env config
  //app.configure('development', function () {
  //  app.locals.pretty = true
  //})
}
