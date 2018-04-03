'use strict';

/**
 * Module dependencies
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  path = require('path'),
  config = require(path.resolve('./config/config')),
  chalk = require('chalk');

var LawRuleSchema = new Schema({
  rule_name: {
    type: String,
    default: '',
    trim: true
  },
  law_data_id: {
    type: Schema.ObjectId, ref: 'LawData'
  },
  law_id: {
    type: Schema.ObjectId, ref: 'Law'
  },
  fields: [
    {
      name: {
        type: String,
        trim: true
      },
      properties: [
        {
          type: {
            type: Number
          },
          value: {
            type: String,
            trim: true
          },
          value1: { type: Number },
          compare1: { type: String },
          value2: { type: Number },
          compare2: { type: String }
        }
      ]
    }
  ]
});

mongoose.model('LawRule', LawRuleSchema, 'lawRule');

