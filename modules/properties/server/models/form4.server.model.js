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
var MasterCheckSheetForm4Schema = new Schema({
  id: { type: String, trim: true },
  item1: { type: String, trim: true },
  item2: { type: String, trim: true },
  legal_text: { type: String, trim: true },
  rowspan: { type: Number, default: 0 },
  ck_ro: { type: Number, default: 0 },
  rowspan_ck_ha1: { type: Number, default: 0 },
  ck_ha2: { type: Number, default: 0 },
  rowspan_ck_ha2: { type: Number, default: 0 },
  form1: { type: Number, default: null }
});

mongoose.model('MasterCheckSheetForm4', MasterCheckSheetForm4Schema, 'masterCheckSheetForm4');
