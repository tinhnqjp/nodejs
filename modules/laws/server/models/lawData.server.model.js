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
  rowspan: {
    type: Number,
    default: 0
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

