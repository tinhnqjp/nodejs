'use strict';

/**
 * Module dependencies
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  path = require('path'),
  config = require(path.resolve('./config/config')),
  LawData = mongoose.model('LawData'),
  chalk = require('chalk');

var LawRegulationSchema = new Schema({
  law_id: { type: Schema.ObjectId, ref: 'Law' },
  todoufuken_regulations: [
    {
      todoufuken: {
        type: String,
        enum: [
          '北海道',
          '青森県',
          '岩手県',
          '宮城県',
          '秋田県',
          '山形県',
          '福島県',
          '茨城県',
          '栃木県',
          '群馬県',
          '埼玉県',
          '千葉県',
          '東京都',
          '神奈川県',
          '新潟県',
          '富山県',
          '石川県',
          '福井県',
          '山梨県',
          '長野県',
          '岐阜県',
          '静岡県',
          '愛知県',
          '三重県',
          '滋賀県',
          '京都府',
          '大阪府',
          '兵庫県',
          '奈良県',
          '和歌山県',
          '鳥取県',
          '島根県',
          '岡山県',
          '広島県',
          '山口県',
          '徳島県',
          '香川県',
          '愛媛県',
          '高知県',
          '福岡県',
          '佐賀県',
          '長崎県',
          '熊本県',
          '大分県',
          '宮崎県',
          '鹿児島県',
          '沖縄県'
        ]
      },
      law_regulations: [{
        type: Schema.ObjectId, ref: 'LawData'
      }]
    }
  ],
  created: {
    type: Date,
    default: Date.now
  }
});


/** MT 4 */
function createLawRegulationTdfk(lawId, tdfk_name, masterLawTdfkList) {
  return new Promise(function (resolve, reject) {
    LawData.createLawDataList(lawId, masterLawTdfkList)
    .then(function (result) {
      var todoufuken_regulation = {
        todoufuken: tdfk_name,
        law_regulations: result
      };
      resolve(todoufuken_regulation);
    })
    .catch(function (err) {
      reject(err);
    });
  });
}

/** MT 5 */
function createListLawRegulationTdfk(lawId, tdfk, masterLawTdfkList) {
  var promises = [];
  tdfk.forEach(function (tdfk_name) {
    promises.push(createLawRegulationTdfk(lawId, tdfk_name, masterLawTdfkList));
  });
  return Promise.all(promises);
}

/** MT 6 */
LawRegulationSchema.statics.saveLawRegulationTdfk = function (lawId, tdfk, masterLawTdfkList) {
  return new Promise(function (resolve, reject) {
    createListLawRegulationTdfk(lawId, tdfk, masterLawTdfkList)
    .then(function (result) {
      var LawRegulation = mongoose.model('LawRegulation');
      var newLawRegulation = new LawRegulation({
        law_id: lawId,
        todoufuken_regulations: result
      });
      return newLawRegulation.save();
    })
    .then(function (result) {
      resolve(result);
    })
    .catch(function (err) {
      reject(err);
    });
  });
};

mongoose.model('LawRegulation', LawRegulationSchema, 'lawRegulation');

