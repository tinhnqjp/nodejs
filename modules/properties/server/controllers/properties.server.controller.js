'use strict';

/**
 * Module dependencies
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Property = mongoose.model('Property'),
  _ = require('lodash'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

/**
 * Create an property
 */
exports.create = function (req, res) {
  console.log(req.body);
  var property = new Property(req.body);
  property.user = req.user;

  property.save(function (err) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(property);
    }
  });
};

/**
 * Show the current property
 */
exports.read = function (req, res) {
  // convert mongoose propertyument to JSON
  var property = req.property ? req.property.toJSON() : {};

  // Add a custom field to the Property, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Property model.
  property.isCurrentUserOwner = !!(req.user && property.user && property.user._id.toString() === req.user._id.toString());

  res.json(property);
};

/**
 * Update an property
 */
exports.update = function (req, res) {
  var property = req.property;
  _.extend(property, req.body);

  property.save(function (err) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(property);
    }
  });
};

/**
 * Delete an property
 */
exports.delete = function (req, res) {
  var property = req.property;

  property.remove(function (err) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(property);
    }
  });
};

/**
 * List of Properties
 */
exports.list = function (req, res) {
  var limit = Number(req.query.limit) || 10;
  var page = Number(req.query.page) || 1;
  Property.find()
  .skip((limit * page) - limit)
  .limit(limit)
  .sort('-created').exec(function (err, properties) {
    Property.count().exec(function (err, count) {
      if (err) {
        return res.status(422).send({
          message: errorHandler.getErrorMessage(err)
        });
      } else {
        res.json({
          properties: properties,
          current: page,
          total: count
        });
      }
    });
  });
};

/**
 * Property middleware
 */
exports.propertyByID = function (req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Property is invalid'
    });
  }

  Property.findById(id).exec(function (err, property) {
    if (err) {
      return next(err);
    } else if (!property) {
      return res.status(404).send({
        message: 'No property with that identifier has been found'
      });
    }
    req.property = property;
    next();
  });
};
