'use strict';

/**
 * Module dependencies
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  path = require('path'),
  config = require(path.resolve('./config/config')),
  chalk = require('chalk');

var MasterPropertiesSchema = new Schema({
  bukken: { type: Number },
  bukken_name: { type: String, trim: true },
  daikoumoku: { type: Number },
  daikoumoku_name: { type: String, trim: true },
  kokoumoku: { type: Number },
  kokoumoku_name: { type: String, trim: true },
  type: { type: Number },
  value: { type: String, trim: true },
  list: { type: String, trim: true }
});

mongoose.model('MasterProperties', MasterPropertiesSchema, 'masterProperties');

