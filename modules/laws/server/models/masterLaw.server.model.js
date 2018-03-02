'use strict';

/**
 * Module dependencies
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  path = require('path'),
  config = require(path.resolve('./config/config')),
  chalk = require('chalk');

var MasterLawSchema = new Schema({
  id: {
    type: String,
    trim: true
  },
  item1: {
    type: String,
    trim: true
  },
  item2: {
    type: String,
    trim: true
  },
  legal_text: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    enum: [
      'detail',
      'tdfk'
    ]
  }
});

mongoose.model('MasterLaw', MasterLawSchema, 'masterLaw');

