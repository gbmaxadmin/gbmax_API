/*!
 * Module dependencies.
 */

var async = require('async')

/**
 * Controllers
 */

var users = require('../app/controllers/users')
  , articles = require('../app/controllers/articles')
  , sessions = require('../app/controllers/sessions')
  , auth = require('./middlewares/authorization')
  , mongoose = require('mongoose')
  , cookie = require('cookie-signature')
  , _ = require('underscore')

/**
 * Route middlewares
 */

var articleAuth = [auth.requiresLogin, auth.article.hasAuthorization]

/**
 * Expose routes
 */

module.exports = function (app, passport) {
  
  //var router = express.Router(); 

  // CORS
  // ------
  
  app.all('/*', function(req, res, next) {
      console.log('all route')
    //NOTE:  can't use wildcard for Origing if using Credentials=true
    //see NOTE in web_framework frontenbd - main.js
    //NOTE:  reading the header.origing from the req and setting it seems to work???
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,HEAD,DELETE,OPTIONS,COPY');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, X-Five9-Copy-Resource');
    res.header('Access-Control-Allow-Credentials', true);
    res.header('cookie', JSON.stringify(req.cookies));
    next();
  });
  

  // home route
  app.get('/', articles.index)
  
  //app.get('/', function(req, res) {
  //    console.log('index route')
  //	  res.json({ message: 'hooray! welcome to our api!' });
  //	});

  //auth 
  //*********
  //
  //
 

  app.post('/users/session', function(req, res, next) {
      
      console.log('local authentication')

    passport.authenticate('local', function(err, user, info) {
      if (err) { 
        return next(err); 
      }
      if (!user) { 
        //console.log('login info..', info);
        return res.status(401).json(info);
      }
      req.logIn(user, function(err) {
        if (err) { return next(err); }

        //go to go...
        return res.status(200).json(user);
      });
    })(req, res, next);

  });

  app.get('/users/session', auth.requiresLogin, sessions.getSessionInfo);
  app.get('/users/session/logout', sessions.logOutSession);

  app.get('/auth/test2', users.test2);



  //TODO:  convert to REST style
  app.get('/login', users.login)
  app.get('/signup', users.signup)
  app.get('/logout', users.logout)


  //FB
  app.get('/auth/facebook',
    passport.authenticate('facebook', {
      scope: [ 'email', 'user_about_me'],
      failureRedirect: '/login'
    }), users.signin)
  app.get('/auth/facebook/callback',
    passport.authenticate('facebook', {
      failureRedirect: '/login'
    }), users.authCallback)

  //twitter
  app.get('/auth/twitter',
    passport.authenticate('twitter', {
      failureRedirect: '/login'
    }), users.signin)
  app.get('/auth/twitter/callback',
    passport.authenticate('twitter', {
      failureRedirect: '/login'
    }), users.authCallback)

  //github
  app.get('/auth/github',
    passport.authenticate('github', {
      failureRedirect: '/login'
    }), users.signin)
  app.get('/auth/github/callback',
    passport.authenticate('github', {
      failureRedirect: '/login'
    }), users.authCallback)

  //google
  app.get('/auth/google',
    passport.authenticate('google', {
      failureRedirect: '/login',
      scope: [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email'
      ]
    }), users.signin)
  app.get('/auth/google/callback',
    passport.authenticate('google', {
      failureRedirect: '/login'
    }), users.authCallback)

  //linkedin
  app.get('/auth/linkedin',
    passport.authenticate('linkedin', {
      failureRedirect: '/login',
      scope: [ 
        'r_emailaddress'
      ]
    }), users.signin)
  app.get('/auth/linkedin/callback',
    passport.authenticate('linkedin', {
      failureRedirect: '/login'
    }), users.authCallback)


  // user routes
  //**************

  app.post('/users', users.create)
  app.get('/users/:userId', users.show)

  app.param('userId', users.user)

  app.post('/users/test1', function(req, res) {
    console.log('posting...');
    return res.status(200).json( { 'msg':'testing...'} );
  });



  
  // article routes
  app.get('/articles', articles.index)
  app.get('/articles/new', auth.requiresLogin, articles.new)
  app.post('/articles', auth.requiresLogin, articles.create)
  app.get('/articles/:id', articles.show)
  app.get('/articles/:id/edit', articleAuth, articles.edit)
  app.put('/articles/:id', articleAuth, articles.update)
  app.del('/articles/:id', articleAuth, articles.destroy)

  app.param('id', articles.load)


  // comment routes
  var comments = require('../app/controllers/comments')
  app.post('/articles/:id/comments', auth.requiresLogin, comments.create)
  app.get('/articles/:id/comments', auth.requiresLogin, comments.create)

  // tag routes
  var tags = require('../app/controllers/tags')
  app.get('/tags/:tag', tags.index)


  //API
  var User = mongoose.model('User');
  app.get('/api/users', auth.requiresLogin, function(req, res){
    console.log('the session...',req.session);
    console.log('sessionID...', req.sessionID);

    User.find({}, function(err, users) {
      res.json(users);
    });

  });
    
  //app.use('/', router);


}
