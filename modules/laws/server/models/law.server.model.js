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
 * Law Schema
 */
var LawSchema = new Schema({
  year: {
    type: Number,
    required: '年度が選択されていません。'
  },
  name: {
    type: String,
    trim: true,
    required: '名称が入力されていません。'
  },
  created: {
    type: Date,
    default: Date.now
  },
  law_details: {
    type: Schema.ObjectId, ref: 'LawDetail'
  },
  todoufuken_regulations: {
    type: Schema.ObjectId, ref: 'LawRegulation'
  }
});

mongoose.model('Law', LawSchema);
