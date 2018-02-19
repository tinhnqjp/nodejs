'use strict';

/**
 * Module dependencies
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Doc = mongoose.model('Doc'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

/**
 * Create an doc
 */
exports.create = function (req, res) {
  var doc = new Doc(req.body);
  doc.user = req.user;

  doc.save(function (err) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(doc);
    }
  });
};

/**
 * Show the current doc
 */
exports.read = function (req, res) {
  // convert mongoose document to JSON
  var doc = req.doc ? req.doc.toJSON() : {};

  // Add a custom field to the Doc, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Doc model.
  doc.isCurrentUserOwner = !!(req.user && doc.user && doc.user._id.toString() === req.user._id.toString());

  res.json(doc);
};

/**
 * Update an doc
 */
exports.update = function (req, res) {
  var doc = req.doc;

  doc.meishou = req.body.meishou;
  doc.hourei_nasuta = req.body.hourei_nasuta;
  doc.laws = req.body.laws;

  doc.save(function (err) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(doc);
    }
  });
};

/**
 * Delete an doc
 */
exports.delete = function (req, res) {
  var doc = req.doc;

  doc.remove(function (err) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(doc);
    }
  });
};

/**
 * List of Docs
 */
exports.list = function (req, res) {
  Doc.find().sort('-created').populate('user', 'displayName').exec(function (err, docs) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(docs);
    }
  });
};

/**
 * Doc middleware
 */
exports.docByID = function (req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Doc is invalid'
    });
  }

  Doc.findById(id).populate('user', 'displayName').exec(function (err, doc) {
    if (err) {
      return next(err);
    } else if (!doc) {
      return res.status(404).send({
        message: 'No doc with that identifier has been found'
      });
    }
    req.doc = doc;
    next();
  });
};
