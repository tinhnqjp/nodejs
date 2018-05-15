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
 * Doc Schema
 */
var DocSchema = new Schema({
  created: {
    type: Date,
    default: Date.now
  },
  form1_ro: [],
  form1_ha: [],
  form1_item: [],
  form4_ro: [],
  form4_ha1: [],
  form4_ha2: [],
  form4_item: [],
  form7_ro1: [],
  form7_ro2: [],
  form7_item: [],
  property: {
    type: Schema.ObjectId,
    ref: 'Property'
  },
  mentions: [{
    clause: { type: String, trim: true },
    headline: { type: String, trim: true },
    time1_check: { type: Boolean, default: false },
    time2_check: { type: Boolean, default: false },
    final_check: { type: Boolean, default: false }
  }],
  formMen_ro: [],
  formMen_ha: [],
  formMen_item: []
});

mongoose.model('Doc', DocSchema);

