'use strict';

/**
 * Module dependencies
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Law = mongoose.model('Law'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

/**
 * Create an law
 */
exports.create = function (req, res) {
  var law = new Law(req.body);
  law.user = req.user;

  law.save(function (err) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(law);
    }
  });
};

/**
 * Show the current law
 */
exports.read = function (req, res) {
  // convert mongoose lawument to JSON
  var law = req.law ? req.law.toJSON() : {};

  // Add a custom field to the Law, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Law model.
  law.isCurrentUserOwner = !!(req.user && law.user && law.user._id.toString() === req.user._id.toString());

  res.json(law);
};

/**
 * Update an law
 */
exports.update = function (req, res) {
  var law = req.law;

  law.title = req.body.title;
  law.laws_titles = req.body.laws_titles;

  law.save(function (err) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(law);
    }
  });
};

/**
 * Delete an law
 */
exports.delete = function (req, res) {
  var law = req.law;

  law.remove(function (err) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(law);
    }
  });
};

/**
 * List of Laws
 */
exports.list = function (req, res) {
  var limit = Number(req.query.limit) || 10;
  var page = Number(req.query.page) || 1;
  Law.find()
  .skip((limit * page) - limit)
  .limit(limit)
  .sort('-created').populate('user', 'displayName').exec(function (err, laws) {
    Law.count().exec(function (err, count) {
      if (err) {
        return res.status(422).send({
          message: errorHandler.getErrorMessage(err)
        });
      } else {
        res.json({
          laws: laws,
          current: page,
          total: count
        });
      }
    });
  });
};

/**
 * Law middleware
 */
exports.lawByID = function (req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Law is invalid'
    });
  }

  Law.findById(id).populate('user', 'displayName').exec(function (err, law) {
    if (err) {
      return next(err);
    } else if (!law) {
      return res.status(404).send({
        message: 'No law with that identifier has been found'
      });
    }
    req.law = law;
    next();
  });
};
