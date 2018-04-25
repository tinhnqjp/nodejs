'use strict';

/**
 * Module dependencies
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Mention = mongoose.model('Mention'),
  Property = mongoose.model('Property'),
  Law = mongoose.model('Law'),
  LawData = mongoose.model('LawData'),
  LawRule = mongoose.model('LawRule'),
  LawDetail = mongoose.model('LawDetail'),
  LawRegulation = mongoose.model('LawRegulation'),
  MasterLaw = mongoose.model('MasterLaw'),
  MasterProperties = mongoose.model('MasterProperties'),
  _ = require('lodash'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

/**
 * Create an mention
 */
exports.create = function (req, res) {
  var mention = new Mention(req.body);
  mention.user = req.user;

  mention.save(function (err) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(mention);
    }
  });
};

/**
 * Show the current mention
 */
exports.read = function (req, res) {
  // convert mongoose mentionument to JSON
  var mention = req.mention ? req.mention.toJSON() : {};

  // Add a custom field to the Mention, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Mention model.
  mention.isCurrentUserOwner = !!(req.user && mention.user && mention.user._id.toString() === req.user._id.toString());

  res.json(mention);
};

/**
 * Update an mention
 */
exports.update = function (req, res) {
  var mention = req.mention;
  _.extend(mention, req.body);

  mention.save(function (err) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(mention);
    }
  });
};

/**
 * Delete an mention
 */
exports.delete = function (req, res) {
  var mention = req.mention;

  mention.remove(function (err) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(mention);
    }
  });
};

/**
 * List of Mentions
 */
exports.list = function (req, res) {
  var limit = Number(req.query.limit) || 10;
  var page = Number(req.query.page) || 1;
  Mention.find()
    .skip((limit * page) - limit)
    .limit(limit).exec(function (err, mentions) {
      Mention.count().exec(function (err, count) {
        if (err) {
          return res.status(422).send({
            message: errorHandler.getErrorMessage(err)
          });
        } else {
          res.json({
            mentions: mentions,
            current: page,
            total: count
          });
        }
      });
    });
};

/**
 * Mention middleware
 */
exports.mentionByID = function (req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Mention is invalid'
    });
  }

  Mention.findById(id).populate('user', 'displayName').exec(function (err, mention) {
    if (err) {
      return next(err);
    } else if (!mention) {
      return res.status(404).send({
        message: 'No mention with that identifier has been found'
      });
    }
    req.mention = mention;
    next();
  });
};

exports.copy = function (req, res) {
  var contents = [];
  req.mention.contents.forEach(function (item) {
    var clone = _.clone(item);
    delete(clone._id);
    contents.push(clone);
  });
  var newMention = new Mention({
    name: req.mention.name + ' - コピー',
    contents: contents
  });

  newMention.save(function (err) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(newMention);
    }
  });
};
