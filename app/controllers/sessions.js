
/**
 * Module dependencies.
 */

var mongoose = require('mongoose')
  , Session = mongoose.model('Session')
  , utils = require('../../lib/utils')
  , _ = require('underscore')

/**
 * List All Sessions
 */

exports.list = function(req, res){
  Session.find({}, function (err, sessions) {
    if (err){
    	return res.status(500).json({ error: 'Could not list sessions.'});
    } 
    if (!session) return res.status(404).json({ error: 'There are no sessions.'});
  })
}

/**
 * get a session by _id
 */

exports.getSessionInfo = function(req, res){
  console.log('get session...');
  var ret = {
    _id: req.sessionID,
    username: req.user.username,
    name: req.user.name,
    email: req.user.email,
    user_id: req.user._id
  };
  return res.status(200).json(ret);  
}


/**
*
*/

exports.logOutSession = function(req, res){
  console.log('logout session...', req.sessionID);
	req.logout();
	return res.status(200).json({ logout: 'ok' }); 
}

