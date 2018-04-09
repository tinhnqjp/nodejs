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
  doc: {
    type: Schema.ObjectId,
    ref: 'Doc'
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
  },
  men3_1_1: { type: String },
  men3_1_2: { type: String },
  men3_2_1: { type: String },
  men3_2_2: { type: String },
  men3_4: { type: String },
  men3_5: { type: String },
  men3_6_1: { type: Number },
  men3_6_2: { type: Number },
  // 7.敷地面積
  // ｲ.敷地面積
  men3_7_1_1: { type: Number },
  men3_7_1_2: { type: Number },
  men3_7_1_3: { type: Number },
  men3_7_1_4: { type: Number },
  men3_7_1_5: { type: Number },
  men3_7_1_6: { type: Number },
  men3_7_1_7: { type: Number },
  men3_7_1_8: { type: Number },
  // ﾛ.用途地域等
  men3_7_2_1: { type: String },
  men3_7_2_2: { type: String },
  men3_7_2_3: { type: String },
  men3_7_2_4: { type: String },
  // ﾊ.建築基準法第52条第１項及び第２項の規定による建築物の容積率
  men3_7_3_1: { type: Number },
  men3_7_3_2: { type: Number },
  men3_7_3_3: { type: Number },
  men3_7_3_4: { type: Number },
  // ﾆ.建築基準法第53条第１項の規定による建築物の建蔽率
  men3_7_4_1: { type: Number },
  men3_7_4_2: { type: Number },
  men3_7_4_3: { type: Number },
  men3_7_4_4: { type: Number },
  // ﾎ.敷地面積の合計
  men3_7_5_1: { type: Number },
  men3_7_5_2: { type: Number }
  // 8.主要用途

});

mongoose.model('Property', PropertySchema);
