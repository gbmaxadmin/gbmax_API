/*!
 * Module dependencies.
 */

var async = require('async')

/**
 * Controllers
 */

var users = require('../app/controllers/users')
  , articles = require('../app/controllers/articles')
  , auth = require('./middlewares/authorization')
  , mongoose = require('mongoose')

/**
 * Route middlewares
 */

var articleAuth = [auth.requiresLogin, auth.article.hasAuthorization]

/**
 * Expose routes
 */

module.exports = function (app, passport) {

  // user routes
  app.get('/invalidlogin', users.invalidlogin)
  app.get('/login', users.login)
  app.get('/signup', users.signup)
  app.get('/logout', users.logout)
  app.post('/users', users.create)

  /*
  app.post('/users/session',
    passport.authenticate('local', {
      failureRedirect: '/invalidlogin',
      failureFlash: 'Invalid email or password.'
    }), users.session)
  */

  app.post('/users/test1', function(req, res) {
    console.log('posting...');
    return res.status(200).json( { 'msg':'testing...'} );
  });

  app.post('/users/session', function(req, res, next) {
    console.log('post to session...');
    passport.authenticate('local', function(err, user, info) {
      console.log('passport authenticate...', user);
      if (err) { 
        return next(err); 
      }
      if (!user) { 
        //return res.redirect('/login'); 
        return res.status(401).json({ 'message': 'invalid login' });
        
      }
      req.logIn(user, function(err) {
        if (err) { return next(err); }
        //return res.redirect('/api/users');
        return res.status(200).json(user);
      });
    })(req, res, next);
  });

  app.get('/users/:userId', users.show)
  app.get('/auth/facebook',
    passport.authenticate('facebook', {
      scope: [ 'email', 'user_about_me'],
      failureRedirect: '/login'
    }), users.signin)
  app.get('/auth/facebook/callback',
    passport.authenticate('facebook', {
      failureRedirect: '/login'
    }), users.authCallback)
  app.get('/auth/github',
    passport.authenticate('github', {
      failureRedirect: '/login'
    }), users.signin)
  app.get('/auth/github/callback',
    passport.authenticate('github', {
      failureRedirect: '/login'
    }), users.authCallback)
  app.get('/auth/twitter',
    passport.authenticate('twitter', {
      failureRedirect: '/login'
    }), users.signin)
  app.get('/auth/twitter/callback',
    passport.authenticate('twitter', {
      failureRedirect: '/login'
    }), users.authCallback)
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

  app.param('userId', users.user)

  // article routes
  app.get('/articles', articles.index)
  app.get('/articles/new', auth.requiresLogin, articles.new)
  app.post('/articles', auth.requiresLogin, articles.create)
  app.get('/articles/:id', articles.show)
  app.get('/articles/:id/edit', articleAuth, articles.edit)
  app.put('/articles/:id', articleAuth, articles.update)
  app.del('/articles/:id', articleAuth, articles.destroy)

  app.param('id', articles.load)

  // home route
  app.get('/', articles.index)

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
    //res.send('10 users online');
    //res.send({myusers: User.find()});
    //res.status(200).send(JSON.stringify({myusers: User.find()}));
    console.log('the session...',req.session);

    User.find({}, function(err, users) {
      res.json(users);
    });

  });

  app.get('/auth/tokens', function(req, res) {
    console.log('csrf token: ', req.cookies['XSRF-TOKEN']);
    return res.status(200).json( { 'tokens':req.cookies['XSRF-TOKEN']} );
  });

}
