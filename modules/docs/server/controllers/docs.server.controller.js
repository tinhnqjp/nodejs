'use strict';

/**
 * Module dependencies
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Doc = mongoose.model('Doc'),
  Property = mongoose.model('Property'),
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
 * Create an doc
 */
exports.create = function (req, res) {
  var doc = new Doc(req.body);
  doc.user = req.user;

  doc.save(function (err) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(doc);
    }
  });
};

/**
 * Show the current doc
 */
exports.read = function (req, res) {
  // convert mongoose document to JSON
  var doc = req.doc ? req.doc.toJSON() : {};

  // Add a custom field to the Doc, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Doc model.
  doc.isCurrentUserOwner = !!(req.user && doc.user && doc.user._id.toString() === req.user._id.toString());

  res.json(doc);
};

/**
 * Update an doc
 */
exports.update = function (req, res) {
  var doc = req.doc;
  _.extend(doc, req.body);

  doc.save(function (err) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(doc);
    }
  });
};

/**
 * Delete an doc
 */
exports.delete = function (req, res) {
  var doc = req.doc;

  doc.remove(function (err) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(doc);
    }
  });
};

/**
 * List of Docs
 */
exports.list = function (req, res) {
  var limit = Number(req.query.limit) || 10;
  var page = Number(req.query.page) || 1;
  Doc.find()
    .skip((limit * page) - limit)
    .limit(limit)
    .sort('-created').populate('user', 'displayName').exec(function (err, docs) {
      Doc.count().exec(function (err, count) {
        if (err) {
          return res.status(422).send({
            message: errorHandler.getErrorMessage(err)
          });
        } else {
          res.json({
            docs: docs,
            current: page,
            total: count
          });
        }
      });
    });
};

/**
 * Doc middleware
 */
exports.docByID = function (req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Doc is invalid'
    });
  }

  Doc.findById(id).populate('user', 'displayName').exec(function (err, doc) {
    if (err) {
      return next(err);
    } else if (!doc) {
      return res.status(404).send({
        message: 'No doc with that identifier has been found'
      });
    }
    req.doc = doc;
    next();
  });
};

exports.autoChecked = function (req, res) {
  var _docId = req.doc._id;
  var property = null,
    laws = null,
    listMasterLawDetail = null;
  // 1 get property
  getPropertyByDocId(_docId)
    .then(function (_property) {
      property = _property;
      var _year = property.men10.getFullYear();
      // 2 get law by year
      return getLawsByYear(_year);
    })
    .then(function (_laws) {
      laws = _laws;
      // 3 get list masterlaw
      return getMasterLawDetail();
    })
    .then(function (_listMasterLawDetail) {
      listMasterLawDetail = _listMasterLawDetail;

      listMasterLawDetail.forEach((_master, index) => {
        laws.forEach((_laws) => {
          var lawData = filterLawData(_master, _laws.law_details);
          var isValid = false;
          lawData.forEach((_lawData) => {
            isValid = checkValidateRule(_lawData.law_rules);
          });
          console.log(index, lawData, isValid);
        });
      });
      // return getLawDatasByLawId();
      res.json(laws);
    })
    .catch(function (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    });
};

function filterLawData(master_law, _laws) {
  var lawData = _.filter(_laws.law_details, {
    'master_law': master_law._id
  });
  var lawData2 = _.filter(lawData, function (_lawData) {
    return _lawData.law_rules.length > 0;
  });
  return lawData2;
}

function checkValidateRule(_lawRules) {
  var isValid = false;
  _lawRules.forEach((_lawRule) => {
    if (_lawRule.fields.length > 0) {
      // TODO
    }
  });

  return isValid;
}

function checkValidateFields(_fields) {
  var isValid = false;
  _fields.forEach((_field) => {
    if (_field.properties.length > 0) {
      // TODO
    }
  });

  return isValid;
}

function getPropertyByDocId(_docId) {
  return new Promise(function (resolve, reject) {
    Property.findOne({
      doc: _docId
    })
    .exec(function (err, property) {
      if (err) {
        reject(err);
      }
      resolve(property);
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
    .exec(function (err, laws) {
      if (err) {
        reject(err);
      }
      resolve(laws);
    });
  });
}

function getMasterLawDetail() {
  return new Promise(function (resolve, reject) {
    MasterLaw.find()
      .exec(function (err, masterLawList) {
        if (err) {
          reject(err);
        }
        var masterLawDetailList = _.filter(masterLawList, {
          'type': 'detail'
        });

        resolve(masterLawDetailList);
      });
  });
}
