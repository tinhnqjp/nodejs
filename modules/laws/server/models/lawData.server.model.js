'use strict';

/**
 * Module dependencies
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  path = require('path'),
  config = require(path.resolve('./config/config')),
  chalk = require('chalk');

var LawDataSchema = new Schema({
  master_law: {
    type: Schema.ObjectId, ref: 'MasterLaw'
  },
  created: {
    type: Date,
    default: Date.now
  },
  law_id: {
    type: Schema.ObjectId, ref: 'Law'
  },
  law_rules: [
    {
      type: Schema.ObjectId, ref: 'LawRule'
    }
  ]
});

/** MT 1 */
function saveLawData(lawId, item) {
  var LawData = mongoose.model('LawData');
  var newLawData = new LawData({
    master_law: item,
    law_id: lawId
  });
  return newLawData.save();
}

/** MT 2 */
LawDataSchema.statics.createLawDataList = function (lawId, masterLawList) {
  var promises = [];
  masterLawList.forEach(function (item) {
    promises.push(saveLawData(lawId, item));
  });
  return Promise.all(promises);
};

mongoose.model('LawData', LawDataSchema, 'lawData');
