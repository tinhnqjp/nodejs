'use strict';

/**
 * Module dependencies
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Doc = mongoose.model('Doc'),
  Property = mongoose.model('Property'),
  Law = mongoose.model('Law'),
  LawData = mongoose.model('LawData'),
  LawRule = mongoose.model('LawRule'),
  LawDetail = mongoose.model('LawDetail'),
  LawRegulation = mongoose.model('LawRegulation'),
  MasterLaw = mongoose.model('MasterLaw'),
  MasterProperties = mongoose.model('MasterProperties'),
  MasterCheckSheetForm4 = mongoose.model('MasterCheckSheetForm4'),
  _ = require('lodash'),
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
  _.extend(doc, req.body);

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
  var limit = Number(req.query.limit) || 10;
  var page = Number(req.query.page) || 1;
  Doc.find()
    .skip((limit * page) - limit)
    .limit(limit)
    .sort('-created').populate('user', 'displayName').exec(function (err, docs) {
      Doc.count().exec(function (err, count) {
        if (err) {
          return res.status(422).send({
            message: errorHandler.getErrorMessage(err)
          });
        } else {
          res.json({
            docs: docs,
            current: page,
            total: count
          });
        }
      });
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

exports.listMasterCheckSheetForm4 = function (req, res) {
  MasterCheckSheetForm4.find().exec(function (err, list) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    }

    res.json(list);
  });
};
