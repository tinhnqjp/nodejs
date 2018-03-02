'use strict';

/**
 * Module dependencies
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Law = mongoose.model('Law'),
  LawDetail = mongoose.model('LawDetail'),
  LawRegulation = mongoose.model('LawRegulation'),
  MasterLaw = mongoose.model('MasterLaw'),
  _ = require('lodash'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

/**
 * Create an law
 */
exports.create = function (req, res) {
  var law = new Law(req.body);
  law.user = req.user;

  law.save(function (err) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(law);
    }
  });
};

/**
 * Show the current law
 */
exports.read = function (req, res) {
  // convert mongoose lawument to JSON
  var law = req.law ? req.law.toJSON() : {};

  // Add a custom field to the Law, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Law model.
  law.isCurrentUserOwner = !!(req.user && law.user && law.user._id.toString() === req.user._id.toString());

  res.json(law);
};

/**
 * Update an law
 */
exports.update = function (req, res) {
  var law = req.law;

  law.title = req.body.title;
  law.laws_titles = req.body.laws_titles;

  law.save(function (err) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(law);
    }
  });
};

/**
 * Delete an law
 */
exports.delete = function (req, res) {
  var law = req.law;

  law.remove(function (err) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(law);
    }
  });
};

exports.createData = function (req, res) {
  var tdfk = [
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
  ];
  // var fs = require('fs');
  // var objData;
  // fs.readFile('C:/Users/ktc/Desktop/data-detail.json', 'utf8', function (errdata, data) {
  //   if (errdata) throw errdata;
  //   objData = JSON.parse(data);
  // var law = new MasterLawDetail({
  //   id: '9999',
  //   item1: '9999',
  //   item2: '9999',
  //   legal_text: '9999'
  // });

  // law.save(function (err) {
  //   if (err) {
  //     return res.status(422).send({
  //       message: errorHandler.getErrorMessage(err)
  //     });
  //   } else {
  //     res.json(law);
  //   }
  // });

  MasterLaw.find().exec(function (err, masterLawList) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    }

    var masterLawDetailList = _.filter(masterLawList, { 'type': 'detail' });
    var masterLawTdfkList = _.filter(masterLawList, { 'type': 'tdfk' });

    var law_details = [];
    masterLawDetailList.forEach((item, index, array) => {
      var newLawDedail = new LawDetail({
        id: item.id,
        item1: item.item1,
        item2: item.item2,
        legal_text: item.legal_text
      });
      newLawDedail.save();
      law_details[index] = newLawDedail;
    });

    var todoufuken_regulations = [];
    tdfk.forEach((_tdfk, _index, array) => {
      var law_regulations_array = [];
      masterLawTdfkList.forEach((item, index, array) => {
        var newLawRegulation = new LawRegulation({
          id: item.id,
          item1: item.item1,
          item2: item.item2,
          legal_text: item.legal_text
        });
        newLawRegulation.save();
        law_regulations_array[index] = newLawRegulation;
      });

      todoufuken_regulations[_index] = {
        todoufuken: _tdfk,
        law_regulations: law_regulations_array
      };
    });

    var lawnew = new Law({
      year: 2016,
      name: '平成30年度 建築基準法施行令',
      law_details: law_details,
      todoufuken_regulations: todoufuken_regulations
    });
    lawnew.save();
  });
  res.end();

  return res.status(200).send({
    message: 'Law created successful'
  });
};

/**
 * List of Laws
 */
exports.list = function (req, res) {

  var limit = Number(req.query.limit) || 10;
  var page = Number(req.query.page) || 1;
  Law.find()
  .populate('law_details')
  .skip((limit * page) - limit)
  .limit(limit)
  .sort('-created').populate('user', 'displayName').exec(function (err, laws) {
    Law.count().exec(function (err, count) {
      if (err) {
        return res.status(422).send({
          message: errorHandler.getErrorMessage(err)
        });
      } else {
        res.json({
          laws: laws,
          current: page,
          total: count
        });
      }
    });
  });
};

/**
 * Law middleware
 */
exports.lawByID = function (req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Law is invalid'
    });
  }

  Law.findById(id)
    .populate('user', 'displayName')
    .populate('law_details')
    .populate('todoufuken_regulations.law_regulations')
    .exec(function (err, law) {
      if (err) {
        return next(err);
      } else if (!law) {
        return res.status(404).send({
          message: 'No law with that identifier has been found'
        });
      }
      req.law = law;
      next();
    });
};

