'use strict';

/**
 * Module dependencies
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  path = require('path'),
  config = require(path.resolve('./config/config')),
  chalk = require('chalk');

var LawDetailSchema = new Schema({
  law_id: { type: Schema.ObjectId, ref: 'Law', childPath: 'law_details' },
  law_details: [{
    type: Schema.ObjectId, ref: 'LawData'
  }],
  created: {
    type: Date,
    default: Date.now
  }
});

mongoose.model('LawDetail', LawDetailSchema, 'lawDetail');

