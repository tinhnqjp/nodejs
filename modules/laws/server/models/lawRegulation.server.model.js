'use strict';

/**
 * Module dependencies
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  path = require('path'),
  config = require(path.resolve('./config/config')),
  chalk = require('chalk');

var LawRegulationSchema = new Schema({
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
  created: {
    type: Date,
    default: Date.now
  },
  law_id: { type:Schema.ObjectId, ref:"Law", childPath:"law_details" }
  // ,
  // law_rules: [
  //   {
  //     law_rule: {
  //       type: Schema.ObjectId, ref: 'law_rules'
  //     }
  //   }
  // ],
});

mongoose.model('LawRegulation', LawRegulationSchema, 'lawRegulation');

