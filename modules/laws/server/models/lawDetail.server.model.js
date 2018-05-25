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

var LawDetailSchema = new Schema({
  law_id: { type: Schema.ObjectId, ref: 'Law', childPath: 'law_details' },
  law_details: [{
    type: Schema.ObjectId, ref: 'LawData'
  }],
  created: {
    type: Date,
    default: Date.now
  }
});

/** MT 3 */
LawDetailSchema.statics.saveLawDetail = function (lawId, masterLawDetailList) {
  return new Promise(function (resolve, reject) {
    var LawDetail = mongoose.model('LawDetail');
    LawData.createLawDataList(lawId, masterLawDetailList)
    .then(function (result) {
      var newLawDedail = new LawDetail({
        law_id: lawId,
        law_details: result
      });
      return newLawDedail.save();
    })
    .then(function (result) {
      resolve(result);
    })
    .catch(function (err) {
      reject(err);
    });
  });
};

mongoose.model('LawDetail', LawDetailSchema, 'lawDetail');

