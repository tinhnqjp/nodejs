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

function createDataComon(req, res) {
  // TODO
  var tdfk = [
    '東京都'
  ];

  var lawnew = new Law();

  MasterLaw.find().exec(function (err, masterLawList) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    }

    var masterLawDetailList = _.filter(masterLawList, {
      'type': 'detail'
    });
    var masterLawTdfkList = _.filter(masterLawList, {
      'type': 'tdfk'
    });
    var lawId = lawnew._id;

    // save to LawDetail
    var law_details = [];
    masterLawDetailList.forEach((item, index, array) => {
      var newLawData = new LawData({
        master_law: item,
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
          master_law: item,
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
    _.extend(lawnew, {
      year: req.body.year,
      name: req.body.name,
      law_details: newLawDedail,
      todoufuken_regulations: newLawRegulation
    });

    lawnew.save(function (err, law) {
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
 * copy law
 */
exports.copy = function (req, res) {
  var oldLawId = req.law._id;
  var newLaw = new Law();
  var newLawId = newLaw._id;
  var oldLaw;

  getLawCopyById(oldLawId)
    .then(function (law) {
      if (!law) {
        return res.status(404).send({
          message: 'No law with that identifier has been found'
        });
      }
      oldLaw = law;

      _.extend(newLaw, {
        year: oldLaw.year,
        name: oldLaw.name + ' - コピー'
      });
      // copy law_details
      return copyLawDataDetail(newLawId, oldLaw.law_details.law_details);
    })
    .then(function (law_details) {
      return createLawDedail(newLawId, law_details);
    })
    .then(function (newLawDedail) {
      // set law_details at newLaw
      newLaw.law_details = newLawDedail;

      // copy todoufuken_regulations
      var oldRegulationDataList = oldLaw.todoufuken_regulations.todoufuken_regulations;
      return createLawRegulation(newLawId, oldRegulationDataList);
    })
    .then(function (newLawRegulation) {
      // set todoufuken_regulations at newLaw
      newLaw.todoufuken_regulations = newLawRegulation;
      return saveLaw(newLaw);
    })
    .then(function (result) {
      res.json(result);
    })
    .catch(function (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
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
  var _lawId = req.law._id;

  removeLaw(_lawId)
  .then(function () {
    return Promise.all([
      removeLawDetail(_lawId),
      removeLawRegulation(_lawId),
      removeLawData(_lawId),
      removeLawRuleByLawId(_lawId)
    ]);
  })
  .then(function () {
    res.json(req.law);
  })
  .catch(function (err) {
    return res.status(422).send({
      message: errorHandler.getErrorMessage(err)
    });
  });
};

exports.createData = function (req, res) {
  // TODO
  var _lawDataId = '5a9d120fa7325530b8b5228e';
  var _lawRules = [{
    rule_name: 'rule 1',
    fields: [{
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
    fields: [{
      bukken: '3',
      deuta1: '2',
      deuta2: '3',
      atai: '1111',
      type: '1'
    }]
  }
  ];
  LawData.findById(_lawDataId)
    .exec(function (err, law_Data) {

      var removeLawRule = LawRule.remove({
        law_data_id: law_Data._id
      }, function (err) {
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
  .populate('law_details')
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
  LawDetail.findOne({
    law_id: req.law._id
  })
  .populate({
    path: 'law_details',
    model: 'LawData',
    populate: {
      path: 'master_law',
      model: 'MasterLaw'
    }
  })
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
  LawRegulation.findOne({
    law_id: req.law._id
  })
  .populate('todoufuken_regulations.law_regulations')
  .populate({
    path: 'todoufuken_regulations.law_regulations',
    model: 'LawData',
    populate: {
      path: 'master_law',
      model: 'MasterLaw'
    }
  })
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
  var lawData;
  getLawDataById(_lawDataId)
    .then(function (_law_data) {
      lawData = _law_data;
      return removeLawRule(_lawDataId);
    })
    .then(function () {
      // create new array rules
      var promises = [];
      _lawRules.forEach((item, index, array) => {
        promises.push(saveLawRule(lawData.law_id, _lawDataId, item, index));
      });
      return Promise.all(promises);
    })
    .then(function (law_rules) {
      return updateLawData(lawData, law_rules);
    })
    .then(function (result) {
      res.json(result);
    })
    .catch(function (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    });
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

exports.lawDataByLawId = function (req, res) {
  var _lawId = req.law._id;
  LawData.find({ law_id: _lawId })
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

exports.listMasterLaw = function (req, res) {
  MasterLaw.find().exec(function (err, masterLawList) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    }

    var masterLawDetailList = _.filter(masterLawList, {
      'type': 'detail'
    });
    res.json(masterLawDetailList);
  });
};

exports.requestLawsByYear = function (req, res) {
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
      if (laws.length > 1) {
        reject({ message: '同じ年度の法令データがあります。ご確認ください。' });
      }
      resolve(laws[0]);
    });
  });
}

function getLawDataById(_lawDataId) {
  return new Promise(function (resolve, reject) {
    LawData.findById(_lawDataId)
      .exec(function (err, law_Data) {
        if (err) {
          reject(err);
        }
        resolve(law_Data);
      });
  });
}

function removeLaw(_lawId) {
  return new Promise(function (resolve, reject) {
    var removeLaw = Law.remove({
      _id: _lawId
    }, function (err) {
      if (err) throw err;
    });
    removeLaw.exec(function (err) {
      if (err) {
        reject(err);
      }
      resolve(true);
    });
  });
}

function removeLawDetail(_lawId) {
  return new Promise(function (resolve, reject) {
    var removeLawDetail = LawDetail.remove({
      law_id: _lawId
    }, function (err) {
      if (err) throw err;
    });
    removeLawDetail.exec(function (err) {
      if (err) {
        reject(err);
      }
      resolve(true);
    });
  });
}

function removeLawRegulation(_lawId) {
  return new Promise(function (resolve, reject) {
    var removeLawRegulation = LawRegulation.remove({
      law_id: _lawId
    }, function (err) {
      if (err) throw err;
    });
    removeLawRegulation.exec(function (err) {
      if (err) {
        reject(err);
      }
      resolve(true);
    });
  });
}

function removeLawData(_lawId) {
  return new Promise(function (resolve, reject) {
    var removeLawData = LawData.remove({
      law_id: _lawId
    }, function (err) {
      if (err) throw err;
    });
    removeLawData.exec(function (err) {
      if (err) {
        reject(err);
      }
      resolve(true);
    });
  });
}

function removeLawRuleByLawId(_lawId) {
  return new Promise(function (resolve, reject) {
    var removeLawRule = LawRule.remove({
      law_id: _lawId
    }, function (err) {
      if (err) throw err;
    });
    removeLawRule.exec(function (err) {
      if (err) {
        reject(err);
      }
      resolve(true);
    });
  });
}

function removeLawRule(_lawDataId) {
  return new Promise(function (resolve, reject) {
    var removeLawRule = LawRule.remove({
      law_data_id: _lawDataId
    }, function (err) {
      if (err) {
        reject(err);
      }
    });
    removeLawRule.exec(function (err) {
      if (err) {
        reject(err);
      }
      resolve(true);
    });
  });
}

function saveLawRule(_lawId, _lawDataId, _lawRule) {
  return new Promise(function (resolve, reject) {
    // create new array fields in rule
    var fields = [];
    _lawRule.fields.forEach((field, inx) => {
      var nameFiled = field.bukken + '_' + field.deuta1;
      if (field.deuta2) {
        nameFiled += '_' + field.deuta2;
      }
      var f = {
        name: nameFiled,
        properties: field.properties
      };
      fields[inx] = f;
    });

    var newRule = new LawRule({
      rule_name: _lawRule.rule_name,
      law_data_id: _lawDataId,
      law_id: _lawId,
      fields: fields
    });

    newRule.save(function (err) {
      if (err) {
        reject(err);
      }
      resolve(newRule);
    });
  });
}

function updateLawData(_law_data, _law_rules) {
  return new Promise(function (resolve, reject) {
    _law_data.law_rules = _law_rules;
    _law_data.save(function (err) {
      if (err) {
        reject(err);
      }
      resolve(_law_data);
    });
  });
}

function getLawCopyById(_lawId) {
  return new Promise(function (resolve, reject) {
    Law.findById(_lawId)
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
          reject(err);
        }
        resolve(law);
      });
  });
}

function copyNewLawData(_lawId, _itemData) {
  return new Promise(function (resolve, reject) {
    var newLawData = new LawData({
      master_law: _itemData.master_law,
      law_id: _lawId
    });

    var law_rules = [];
    _itemData.law_rules.forEach((itemRule, r) => {
      // create rule
      var newFields = [];
      itemRule.fields.forEach((iField, i) => {
        var newProperties = [];
        if (iField.properties) {
          iField.properties.forEach((iProperties, k) => {
            newProperties[k] = {
              value: iProperties.value
            };
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
        law_id: _lawId,
        fields: newFields
      });
      newRule.save(function (err) {
        if (err) {
          reject(err);
        }
      });
      law_rules[r] = newRule;
    });

    newLawData.law_rules = law_rules;
    newLawData.save(function (err) {
      if (err) {
        reject(err);
      }
      resolve(newLawData);
    });
  });
}

function copyLawDataDetail(_lawId, _oldLawDataList) {
  var promises = [];
  _oldLawDataList.forEach((itemData, index, array) => {
    promises.push(copyNewLawData(_lawId, itemData));
  });
  return Promise.all(promises);
}

function copyLawDataTdfk(_lawId, _oldLawDataList, _todoufuken) {
  return new Promise(function (resolve, reject) {
    var promises = [];
    _oldLawDataList.forEach((itemData, index, array) => {
      promises.push(copyNewLawData(_lawId, itemData));
    });
    Promise.all(promises).then(function (law_regulations) {
      return resolve({
        todoufuken: _todoufuken,
        law_regulations: law_regulations
      });
    }).catch(err => {
      return reject(err);
    });
  });
}

function createLawDedail(_lawId, _law_details) {
  return new Promise(function (resolve, reject) {
    var newLawDedail = new LawDetail({
      law_id: _lawId,
      law_details: _law_details
    });
    newLawDedail.save(function (err) {
      if (err) {
        reject(err);
      }
      resolve(newLawDedail);
    });
  });
}

function createLawRegulation(_lawId, _oldRegulationDataList) {
  return new Promise(function (resolve, reject) {
    var promises = [];
    _oldRegulationDataList.forEach((itemReg, _index) => {
      promises.push(copyLawDataTdfk(_lawId, itemReg.law_regulations, itemReg.todoufuken));
    });

    Promise.all(promises).then(result => {
      var newLawRegulation = new LawRegulation({
        law_id: _lawId,
        todoufuken_regulations: result
      });
      newLawRegulation.save(function (err) {
        if (err) {
          reject(err);
        }
        return resolve(newLawRegulation);
      });
    }).catch(err => {
      return reject(err);
    });
  });
}

function saveLaw(_law) {
  return new Promise(function (resolve, reject) {
    _law.save(function (err) {
      if (err) {
        reject(err);
      }
      resolve(_law);
    });
  });
}

