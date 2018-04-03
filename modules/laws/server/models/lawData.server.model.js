'use strict';

/**
 * Module dependencies
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  path = require('path'),
  config = require(path.resolve('./config/config')),
  chalk = require('chalk');

var LawDataSchema = new Schema({
  master_law: {
    type: Schema.ObjectId, ref: 'MasterLaw'
  },
  created: {
    type: Date,
    default: Date.now
  },
  law_id: {
    type: Schema.ObjectId, ref: 'Law'
  },
  law_rules: [
    {
      type: Schema.ObjectId, ref: 'LawRule'
    }
  ]
});

mongoose.model('LawData', LawDataSchema, 'lawData');

