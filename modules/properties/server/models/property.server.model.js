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
  men3_3: [{ type: String }],
  men3_4: [{ type: String }],
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
  men3_7_5_2: { type: Number },
  // ﾍ.敷地に建築可能な延べ面積を敷地面積で除した数値
  men3_7_6: { type: Number },
  // ﾄ.敷地に建築可能な建築面積を敷地面積で除した数値
  men3_7_7: { type: Number },
  // 8.主要用途
  men3_8_1: { type: String },
  men3_8_2: { type: String },
  men3_8_3: { type: String },
  // 9.工事種別
  men3_9: [{ type: String }],
  // 10.建築面積
  men3_10_1_1: { type: Number },
  men3_10_1_2: { type: Number },
  men3_10_1_3: { type: Number },
  men3_10_2: { type: Number },
  // 11.延べ面積 ｲ.建築物全体
  men3_11_1_1: { type: Number },
  men3_11_1_2: { type: Number },
  men3_11_1_3: { type: Number },
  // ﾛ.地階の住宅又は老人ホーム、福祉ホームその他これらに類するものの部分
  men3_11_2_1: { type: Number },
  men3_11_2_2: { type: Number },
  men3_11_2_3: { type: Number },
  // ﾊ.エレベーターの昇降路の部分
  men3_11_3_1: { type: Number },
  men3_11_3_2: { type: Number },
  men3_11_3_3: { type: Number },
  // ﾆ.共同住宅の共用の廊下等の部分
  men3_11_4_1: { type: Number },
  men3_11_4_2: { type: Number },
  men3_11_4_3: { type: Number },
  // ﾎ.自動車車庫等の部分
  men3_11_5_1: { type: Number },
  men3_11_5_2: { type: Number },
  men3_11_5_3: { type: Number },
  // ﾍ.備蓄倉庫の部分
  men3_11_6_1: { type: Number },
  men3_11_6_2: { type: Number },
  men3_11_6_3: { type: Number },
  // ﾄ.蓄電池の設置部分
  men3_11_7_1: { type: Number },
  men3_11_7_2: { type: Number },
  men3_11_7_3: { type: Number },
  // ﾁ.自家発電設備の設置部分
  men3_11_8_1: { type: Number },
  men3_11_8_2: { type: Number },
  men3_11_8_3: { type: Number },
  // ﾘ.貯水槽の設置部分
  men3_11_9_1: { type: Number },
  men3_11_9_2: { type: Number },
  men3_11_9_3: { type: Number },
  // ﾇ.住宅の部分
  men3_11_10_1: { type: Number },
  men3_11_10_2: { type: Number },
  men3_11_10_3: { type: Number },
  // ﾙ.老人ホーム、福祉ホームその他これらに類するものの部分
  men3_11_11_1: { type: Number },
  men3_11_11_2: { type: Number },
  men3_11_11_3: { type: Number },
  // ｦ.延べ面積
  men3_11_12: { type: Number },
  // ﾜ.容積率
  men3_11_13: { type: Number },
  // 12.建築物の数
  men3_12_1: { type: Number },
  men3_12_2: { type: Number },
  // 13.建築物の高さ等
  // ｲ.最高の高さ
  men3_13_1_1: { type: Number },
  men3_13_1_2: { type: Number },
  // ﾛ.階数
  men3_13_2_1: { type: Number },
  men3_13_2_2: { type: Number },
  men3_13_2_3: { type: Number },
  men3_13_2_4: { type: Number },
  // ﾊ.構造
  men3_13_3_1: { type: String },
  men3_13_3_2: { type: String },
  // ﾆ.建築基準法第56条第７項の規定による特例の適用の有無
  men3_13_4: { type: String },
  // ﾎ.適用があるときは、特例の区分
  men3_13_5: [{ type: String }],
  men3_14: { type: String },
  // form men 4
  // 1.番号
  men4_1: { type: String },
  // 2.用途
  men4_2_1_1: { type: String },
  men4_2_1_2: { type: String },
  men4_2_1_3: { type: String },
  men4_2_2_1: { type: String },
  men4_2_2_2: { type: String },
  men4_2_2_3: { type: String },
  men4_2_3_1: { type: String },
  men4_2_3_2: { type: String },
  men4_2_4_3: { type: String },
  // 3.工事種別
  men4_3: [{ type: String }],
  // 4.構造
  men4_4_1: { type: String },
  men4_4_2: { type: String },
  // 5.耐火建築物等
  men4_5: [{ type: String }],
  // 6.階数
  men4_6_1: { type: String },
  men4_6_2: { type: String },
  men4_6_3: { type: String },
  men4_6_4: { type: String },
  // 7.高さ
  men4_7_1: { type: String },
  men4_7_2: { type: String },
});

mongoose.model('Property', PropertySchema);
