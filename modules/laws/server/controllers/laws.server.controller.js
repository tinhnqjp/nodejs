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

function getNewId() {
  return mongoose.Types.ObjectId();
}

function createDataComon(req, res) {
  // TODO
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

  // console.log(req.body.name); return res;
  MasterLaw.find().exec(function (err, masterLawList) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    }

    var masterLawDetailList = _.filter(masterLawList, { 'type': 'detail' });
    var masterLawTdfkList = _.filter(masterLawList, { 'type': 'tdfk' });
    var lawId = getNewId();

    // save to LawDetail
    var law_details = [];
    masterLawDetailList.forEach((item, index, array) => {
      var newLawData = new LawData({
        id: item.id,
        item1: item.item1,
        item2: item.item2,
        legal_text: item.legal_text,
        law_id: lawId
      });
      newLawData.save();
      law_details[index] = newLawData;
    });
    var newLawDedail = new LawDetail({
      law_id: lawId,
      law_details: law_details
    });
    newLawDedail.save();

    // save to lawRegulation
    var todoufuken_regulations = [];
    tdfk.forEach((_tdfk, _index, array) => {
      var law_regulations_array = [];
      masterLawTdfkList.forEach((item, index, array) => {
        var newLawDataReg = new LawData({
          id: item.id,
          item1: item.item1,
          item2: item.item2,
          legal_text: item.legal_text,
          law_id: lawId
        });
        newLawDataReg.save();
        law_regulations_array[index] = newLawDataReg;
      });

      todoufuken_regulations[_index] = {
        todoufuken: _tdfk,
        law_regulations: law_regulations_array
      };
    });
    var newLawRegulation = new LawRegulation({
      law_id: lawId,
      todoufuken_regulations: todoufuken_regulations
    });
    newLawRegulation.save();

    // save to law
    var lawnew = new Law({
      _id: lawId,
      year: req.body.year,
      name: req.body.name,
      law_details: newLawDedail,
      todoufuken_regulations: newLawRegulation
    });

    lawnew.save(function (err) {
      if (err) {
        return res.status(422).send({
          message: errorHandler.getErrorMessage(err)
        });
      } else {
        res.json(lawnew);
      }
    });
  });
}

/**
 * Create an law
 */
exports.create = function (req, res) {
  createDataComon(req, res);
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
 * copy new law data
 * @param {*} oldLawDataList list old
 * @param {*} lawId law id new
 */
function copyNewLawData(oldLawDataList, lawId) {
  var law_details = [];
  oldLawDataList.forEach((itemData, index, array) => {
    var newLawData = new LawData({
      _id: getNewId(),
      id: itemData.id,
      item1: itemData.item1,
      item2: itemData.item2,
      legal_text: itemData.legal_text,
      law_id: lawId
    });

    var law_rules = [];
    itemData.law_rules.forEach((itemRule, r) => {
      // create rule
      var newFields = [];
      itemRule.fields.forEach((iField, i) => {
        var newProperties = [];
        if (iField.properties) {
          iField.properties.forEach((iProperties, k) => {
            newProperties[k] = { value: iProperties.value };
          });
        }
        newFields[i] = {
          name: iField.name,
          properties: newProperties
        };
      });
      var newRule = new LawRule({
        rule_name: itemRule.rule_name,
        law_data_id: newLawData._id,
        law_id: lawId,
        fields: newFields
      });
      newRule.save();
      law_rules[r] = newRule;
    });

    newLawData.law_rules = law_rules;
    newLawData.save();
    law_details[index] = newLawData;
  });

  return law_details;
}
/**
 * copy law
 */
exports.copy = function (req, res) {
  var _law = req.law;
  var lawId = getNewId();
  Law.findById(_law._id)
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
  .exec(function (err, law) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else if (!law) {
      return res.status(404).send({
        message: 'No law with that identifier has been found'
      });
    }

    var newLaw = new Law({
      _id: lawId,
      year: law.year,
      name: law.name
    });

    // copy law_details
    var oldDetailLawDataList = law.law_details.law_details;
    var law_details = copyNewLawData(oldDetailLawDataList, lawId);
    var newLawDedail = new LawDetail({
      law_id: lawId,
      law_details: law_details
    });
    newLawDedail.save(function (err) {
      if (err) {
        return res.status(422).send({
          message: errorHandler.getErrorMessage(err)
        });
      }
    });
    newLaw.law_details = newLawDedail;

    // copy todoufuken_regulations
    var oldRegulationDataList = law.todoufuken_regulations.todoufuken_regulations;
    var todoufuken_regulations = [];
    oldRegulationDataList.forEach((itemReg, _index) => {
      var law_regulations = copyNewLawData(itemReg.law_regulations, lawId);

      todoufuken_regulations[_index] = {
        todoufuken: itemReg.todoufuken,
        law_regulations: law_regulations
      };
    });
    var newLawRegulation = new LawRegulation({
      law_id: lawId,
      todoufuken_regulations: todoufuken_regulations
    });
    newLawRegulation.save(function (err) {
      if (err) {
        return res.status(422).send({
          message: errorHandler.getErrorMessage(err)
        });
      }
    });
    newLaw.todoufuken_regulations = newLawRegulation;

    newLaw.save(function (err) {
      if (err) {
        return res.status(422).send({
          message: errorHandler.getErrorMessage(err)
        });
      }
    });
    return res.end();
  });
};

/**
 * Update an law
 */
exports.update = function (req, res) {
  var law = req.law;

  law.year = req.body.year;
  law.name = req.body.name;

  law.save(function (err) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.end();
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
      var removeLawDetail = LawDetail.remove({ law_id: law._id }, function (err) {
        if (err) throw err;
      });
      removeLawDetail.exec();

      var removeLawRegulation = LawRegulation.remove({ law_id: law._id }, function (err) {
        if (err) throw err;
      });
      removeLawRegulation.exec();

      var removeLawData = LawData.remove({ law_id: law._id }, function (err) {
        if (err) throw err;
      });
      removeLawData.exec();

      var removeLawRule = LawRule.remove({ law_id: law._id }, function (err) {
        if (err) throw err;
      });
      removeLawRule.exec();

      res.json(law);
    }
  });
};

exports.createData = function (req, res) {
  // TODO
  var _lawDataId = '5a9d120fa7325530b8b5228e';
  var _lawRules = [
    {
      rule_name: 'rule 1',
      fields: [
        {
          bukken: '3',
          deuta1: '2',
          deuta2: '3',
          atai: '1111',
          type: '1'
        },
        {
          bukken: '4',
          deuta1: '7',
          deuta2: '2',
          atai: '22222',
          type: '1'
        }
      ]
    },
    {
      rule_name: 'rule 2',
      fields: [
        {
          bukken: '3',
          deuta1: '2',
          deuta2: '3',
          atai: '1111',
          type: '1'
        }
      ]
    }
  ];
  console.log(_lawDataId);
  LawData.findById(_lawDataId)
    .exec(function (err, law_Data) {

      var removeLawRule = LawRule.remove({ law_data_id: law_Data._id }, function (err) {
        if (err) throw err;
      });
      removeLawRule.exec();

      var law_rules = [];
      _lawRules.forEach((item, index, array) => {
        var fields = [];
        item.fields.forEach((field, inx) => {
          console.log(field);
          var f = {
            type: field.type,
            name: field.bukken + ',' + field.deuta1 + ',' + field.deuta2,
            value: field.atai
          };
          fields[inx] = f;
        });
        var newRule = new LawRule({
          rule_name: item.rule_name,
          law_data_id: law_Data._id,
          law_id: law_Data.law_id,
          fields: fields
        });
        newRule.save();
        law_rules[index] = newRule;
      });
      law_Data.law_rules = law_rules;
      law_Data.save();
    });
  res.end();
};

/**
 * List of Laws
 */
exports.list = function (req, res) {

  var limit = Number(req.query.limit) || 10;
  var page = Number(req.query.page) || 1;
  Law.find()
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
    .populate('todoufuken_regulations')
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

exports.lawDetailById = function (req, res) {
  LawDetail.findOne({ law_id: req.law._id })
    .populate('law_details')
    .exec(function (err, law_details) {
      if (err) {
        return res.status(422).send({
          message: errorHandler.getErrorMessage(err)
        });
      }
      res.json(law_details);
    });
};

exports.lawRegulationById = function (req, res) {
  LawRegulation.findOne({ law_id: req.law._id })
    .populate('todoufuken_regulations.law_regulations')
    .exec(function (err, law_regulations) {
      if (err) {
        return res.status(422).send({
          message: errorHandler.getErrorMessage(err)
        });
      }
      res.json(law_regulations);
    });
};

exports.postLawData = function (req, res) {
  var _lawRules = req.body.lawRules;
  var _lawDataId = req.body.lawDataId;

  LawData.findById(_lawDataId)
    .exec(function (err, law_Data) {

      var removeLawRule = LawRule.remove({ law_data_id: law_Data._id }, function (err) {
        if (err) {
          return res.status(422).send({
            message: errorHandler.getErrorMessage(err)
          });
        }
      });
      removeLawRule.exec();

      var law_rules = [];
      _lawRules.forEach((item, index, array) => {
        var fields = [];
        item.fields.forEach((field, inx) => {
          var f = {
            type: field.type,
            name: field.bukken + ',' + field.deuta1 + ',' + field.deuta2,
            properties: field.properties
          };
          fields[inx] = f;
        });
        var newRule = new LawRule({
          rule_name: item.rule_name,
          law_data_id: law_Data._id,
          law_id: law_Data.law_id,
          fields: fields
        });
        newRule.save(function (err) {
          if (err) {
            return res.status(422).send({
              message: errorHandler.getErrorMessage(err)
            });
          }
        });
        law_rules[index] = newRule;
      });
      law_Data.law_rules = law_rules;
      law_Data.save(function (err) {
        if (err) {
          return res.status(422).send({
            message: errorHandler.getErrorMessage(err)
          });
        }
      });
    });
  return res.end();
};

exports.lawDataById = function (req, res) {
  var id = req.body.id;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'LawData is invalid'
    });
  }

  LawData.findById(id)
    .populate('law_rules')
    .exec(function (err, law_datas) {
      if (err) {
        return res.status(422).send({
          message: errorHandler.getErrorMessage(err)
        });
      }
      res.json(law_datas);
    });
};

/**
 * List of Laws
 */
exports.listMasterProperties = function (req, res) {
  MasterProperties.find({ use_flag: 'TRUE' }).exec(function (err, masterProperties) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(masterProperties);
    }
  });
};
