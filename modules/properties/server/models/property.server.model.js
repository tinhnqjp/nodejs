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
  },
  application_id: { type: Number },
  // 引受日
  men10: { type: Date },
  // １．建築主の概要
  men11: { type: String, trim: true },
  // ２．代表者
  men12: { type: String, trim: true },
  // ３．設計者
  men13: { type: String, trim: true },
  // 事前受付番号
  men14: { type: String, trim: true },
  // 物件名
  men15: { type: String, trim: true },
  // 事前受付日
  men16: { type: Date },
  // 確認受付番号
  men17: { type: String, trim: true },
  men3_1_1: { type: String },
  men3_1_2: { type: String },
  men3_2_1: { type: String },
  men3_2_2: { type: String },
  men3_3: [{ type: String }],
  men3_4: [{ type: String }],
  men3_5_1: [{ type: String }],
  men3_5_2: [{ type: String }],
  men3_5_3: { type: String },
  men3_6_1: { type: Number },
  men3_6_2: { type: Number },
  // 7.敷地面積
  // ｲ.敷地面積
  men3_7_1: {
    c1: { type: Number },
    c2: { type: Number },
    c3: { type: Number },
    c4: { type: Number },
    c5: { type: Number },
    c6: { type: Number },
    c7: { type: Number },
    c8: { type: Number }
  },
  // ﾛ.用途地域等
  men3_7_2: {
    c1: { type: String },
    c2: { type: String },
    c3: { type: String },
    c4: { type: String }
  },
  // ﾍ.敷地に建築可能な延べ面積を敷地面積で除した数値
  men3_7_3: { type: Number },
  // ﾄ.敷地に建築可能な建築面積を敷地面積で除した数値
  men3_7_4: { type: Number },
  // ﾊ.建築基準法第52条第１項及び第２項の規定による建築物の容積率
  men3_7_5: {
    c1: { type: Number },
    c2: { type: Number },
    c3: { type: Number },
    c4: { type: Number }
  },
  // ﾆ.建築基準法第53条第１項の規定による建築物の建蔽率
  men3_7_6: {
    c1: { type: Number },
    c2: { type: Number },
    c3: { type: Number },
    c4: { type: Number }
  },
  // ﾎ.敷地面積の合計
  men3_7_7: {
    c1: { type: Number, default: 0 },
    c2: { type: Number, default: 0 }
  },

  // 8.主要用途
  men3_8: {
    c1: {
      class: { type: String },
      division: { type: String },
      text: { type: String }
    }
  },

  // 9.工事種別
  men3_9: [{ type: String }],
  // 10.建築面積
  men3_10_1: { type: Number },
  men3_10_2: { type: Number },
  men3_10_3: { type: Number },
  men3_10_4: { type: Number },
  // 11.延べ面積
  // ｲ.建築物全体
  men3_11_1: { type: Number },
  men3_11_4: { type: Number },
  men3_11_5: { type: Number },
  // ｦ.延べ面積
  men3_11_2: { type: Number },
  // ﾜ.容積率
  men3_11_3: { type: Number },
  // ﾛ.地階の住宅又は老人ホーム、福祉ホームその他これらに類するものの部分
  men3_11_6: {
    c1: { type: Number },
    c2: { type: Number },
    c3: { type: Number }
  },
  // ﾊ.エレベーターの昇降路の部分
  men3_11_7: {
    c1: { type: Number },
    c2: { type: Number },
    c3: { type: Number }
  },
  // ﾆ.共同住宅の共用の廊下等の部分
  men3_11_8: {
    c1: { type: Number },
    c2: { type: Number },
    c3: { type: Number }
  },
  // ﾎ.自動車車庫等の部分
  men3_11_9: {
    c1: { type: Number },
    c2: { type: Number },
    c3: { type: Number }
  },
  // ﾍ.備蓄倉庫の部分
  men3_11_10: {
    c1: { type: Number },
    c2: { type: Number },
    c3: { type: Number }
  },
  // ﾄ.蓄電池の設置部分
  men3_11_11: {
    c1: { type: Number },
    c2: { type: Number },
    c3: { type: Number }
  },
  // ﾁ.自家発電設備の設置部分
  men3_11_12: {
    c1: { type: Number },
    c2: { type: Number },
    c3: { type: Number }
  },
  // ﾘ.貯水槽の設置部分
  men3_11_13: {
    c1: { type: Number },
    c2: { type: Number },
    c3: { type: Number }
  },
  // ﾇ.住宅の部分
  men3_11_14: {
    c1: { type: Number },
    c2: { type: Number },
    c3: { type: Number }
  },
  // ﾙ.老人ホーム、福祉ホームその他これらに類するものの部分
  men3_11_15: {
    c1: { type: Number },
    c2: { type: Number },
    c3: { type: Number }
  },

  // 12.建築物の数
  men3_12_1: { type: Number },
  men3_12_2: { type: Number },
  // 13.建築物の高さ等
  // ｲ.最高の高さ
  men3_13_1: { type: Number },
  men3_13_2: { type: Number },
  // ﾛ.階数
  // （申請に係る建築物）
  men3_13_3: {
    c1: { type: Number },
    c2: { type: Number }
  },
  // （他の建築物）
  men3_13_4: {
    c1: { type: Number },
    c2: { type: Number }
  },
  // ﾊ.構造
  men3_13_5_1: { type: String },
  men3_13_5_2: { type: String },
  // ﾆ.建築基準法第56条第７項の規定による特例の適用の有無
  men3_13_6: { type: Number },
  // ﾎ.適用があるときは、特例の区分
  men3_13_7: [{ type: String }],

  // 14.許可・認定等
  men3_14: { type: String },
  // 15.工事着手予定年月日
  men3_15: { type: Date },
  // 16.工事完了予定年月日
  men3_16: { type: Date },
  // 17.特定工程工事終了予定年月日
  men3_17: {
    c1: {
      times: { type: Number },
      date: { type: Date }
    },
    c2: {
      times: { type: Number },
      date: { type: Date }
    },
    c3: {
      times: { type: Number },
      date: { type: Date }
    }
  },
  // 18.その他必要な事項
  men3_18: { type: String },
  // 19.備考
  men3_19: { type: String },

  // form men 4
  // 1.番号
  men4_1: { type: Number },
  // 2.用途
  men4_2: {
    c1: {
      class: { type: String },
      division: { type: String },
      text: { type: String }
    },
    c2: {
      class: { type: String },
      division: { type: String },
      text: { type: String }
    },
    c3: {
      class: { type: String },
      division: { type: String },
      text: { type: String }
    }
  },
  // 3.工事種別
  men4_3: [{ type: String }],
  // 4.構造
  men4_4: {
    c1: { type: String },
    c2: { type: String }
  },
  // 5.耐火建築物等
  men4_5: [{ type: String }],
  // 6.階数
  men4_6_1: { type: Number },
  men4_6_2: { type: Number },
  men4_6_3: { type: Number },
  men4_6_4: { type: Number },
  // 7.高さ
  men4_7_1: { type: Number },
  men4_7_2: { type: Number },
  // 8.建築設備の種類
  men4_8: { type: String },
  // 9.確認の特例
  // ｲ.建築基準法第６条の３第１項ただし書又は法１８条第４項ただし書の規定による審査の特例の適用の有無
  men4_9_1: { type: String },
  // ﾛ.建築基準法第６条の４第１項の規定による確認の特例の適用の有無
  men4_9_2: { type: String },
  // ﾊ.建築基準法施行令第１０条各号に掲げる建築物の区分
  men4_9_3: { type: Number },
  // ﾆ.認定型式の認定番号
  men4_9_4: { type: Number },
  // ﾎ.適合する一連の規定の区分
  men4_9_5: [{ type: String }],
  // ﾍ.認証型式部材等認証番号
  men4_9_6: { type: Number },
  // 10.床 面 積
  // 階別合計
  men4_10_1: { type: Number },
  // 申請部分合計
  men4_10_2: { type: Number },
  // 申請以外部分合計
  men4_10_3: { type: Number },
  // 合計合計
  men4_10_4: { type: Number },
  // 階種別
  men4_10_14: { type: String },
  // 階別合計
  men4_10_5: [{
    c0: { type: String }, // 階種別
    c1: { type: Number }, // 階別
    c2: { type: Number }, // 申請部分
    c3: { type: Number }, // 申請以外の部分
    c4: { type: Number } //  合計
  }],

  men4_11: { type: String },
  men4_12: { type: String },
  men4_13: { type: String },
  men4_14: { type: String },
  men4_15: [{ type: String }],
  men4_16: { type: String },
  men4_17: { type: String }
});

mongoose.model('Property', PropertySchema);
