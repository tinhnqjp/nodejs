'use strict';

/**
 * Module dependencies
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  path = require('path'),
  config = require(path.resolve('./config/config')),
  chalk = require('chalk');

/**
 * MasterCheckSheetForm4 Schema
 */
var MasterCheckSheetForm7Schema = new Schema();

mongoose.model('MasterCheckSheetForm7', MasterCheckSheetForm7Schema, 'masterCheckSheetForm7');
