'use strict';

/**
 * Module dependencies
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Law = mongoose.model('Law'),
  LawData = mongoose.model('LawData'),
  LawRule = mongoose.model('LawRule'),
  LawDetail = mongoose.model('LawDetail'),
  LawRegulation = mongoose.model('LawRegulation'),
  MasterLaw = mongoose.model('MasterLaw'),
  MasterProperties = mongoose.model('MasterProperties'),
  _ = require('lodash'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

/**
 * List of Laws
 */
exports.listMasterProperties = function (req, res) {
  MasterProperties.find({
    use_flag: 'TRUE'
  }).exec(function (err, masterProperties) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(masterProperties);
    }
  });
};

exports.listMasterLawDetail = function (req, res) {
  getMasterLaw('detail')
    .then(function (rs) {
      res.json(rs);
    })
    .catch(function (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    });
};

exports.listMasterLawTdfk = function (req, res) {
  getMasterLaw('tdfk')
    .then(function (rs) {
      res.json(rs);
    })
    .catch(function (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    });
};

exports.listLawsByYear = function (req, res) {
  var year = req.body.year;
  getLawsByYear(year)
    .then(function (law) {
      res.json(law);
    })
    .catch(function (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    });
};

/** function private */
function getMasterLaw(type) {
  return new Promise(function (resolve, reject) {
    var condition = {};
    if (type === 'tdfk') {
      condition.type = 'tdfk';
    }
    if (type === 'detail') {
      condition.type = 'detail';
    }
    MasterLaw.find(condition).exec(function (err, result) {
      if (err) {
        reject(err);
      }
      if (result.length === 0) {
        reject({
          message: 'getMasterLaw dont find data'
        });
      }
      resolve(result);
    });
  });
}

function getLawsByYear(_year) {
  return new Promise(function (resolve, reject) {
    Law.find({
      year: _year
    })
    .populate({
      path: 'law_details',
      model: 'LawDetail',
      populate: {
        path: 'law_details',
        model: 'LawData',
        populate: {
          path: 'law_rules',
          model: 'LawRule'
        }
      }
    })
    .populate({
      path: 'todoufuken_regulations',
      model: 'LawRegulation',
      populate: {
        path: 'todoufuken_regulations.law_regulations',
        model: 'LawData',
        populate: {
          path: 'law_rules',
          model: 'LawRule'
        }
      }
    })
    .exec(function (err, laws) {
      if (err) {
        reject(err);
      }
      if (laws.length > 1) {
        reject({
          message: '同じ年度の法令データがあります。ご確認ください。'
        });
      }
      resolve(laws[0]);
    });
  });
}
