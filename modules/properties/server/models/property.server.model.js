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
 * Property Schema
 */
var PropertySchema = new Schema({
  created: {
    type: Date,
    default: Date.now
  },
  men10: {
    type: Date,
    required: '受付欄が入力されていません。'
  },
  men11: {
    type: String,
    trim: true,
    required: '建築主の概要が入力されていません。'
  },
  men12: {
    type: String,
    trim: true,
    required: '代表者の概要が入力されていません。'
  },
  men13: {
    type: String,
    trim: true,
    required: '設計者の概要が入力されていません。'
  }
});

mongoose.model('Property', PropertySchema);
