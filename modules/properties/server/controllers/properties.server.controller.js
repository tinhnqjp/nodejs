'use strict';

/**
 * Module dependencies
 */
var path = require('path'),
  mysql = require('mysql'),
  mongoose = require('mongoose'),
  Property = mongoose.model('Property'),
  MasterProperties = mongoose.model('MasterProperties'),
  MasterCheckSheetForm4 = mongoose.model('MasterCheckSheetForm4'),
  MasterCheckSheetForm7 = mongoose.model('MasterCheckSheetForm7'),
  _ = require('lodash'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

/**
 * Create an property
 */
exports.create = function (req, res) {
  var property = new Property(req.body);
  property.save(function (err) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {

      res.json(property);
    }
  });
};

/**
 * Show the current property
 */
exports.read = function (req, res) {
  // convert mongoose propertyument to JSON
  var property = req.property ? req.property.toJSON() : {};

  // Add a custom field to the Property, for determining if the current User is the 'owner'.
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Property model.
  property.isCurrentUserOwner = !!(req.user && property.user && property.user._id.toString() === req.user._id.toString());

  res.json(property);
};

/**
 * Update an property
 */
exports.update = function (req, res) {
  var property = req.property;
  _.extend(property, req.body);

  property.save(function (err) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(property);
    }
  });
};

function removeProperty(property) {
  return new Promise(function (resolve, reject) {
    property.remove(function (err) {
      if (err) {
        reject(err);
      } else {
        resolve(true);
      }
    });
  });
}

/**
 * Delete an property
 */
exports.delete = function (req, res) {
  var property = req.property;
  removeProperty(property)
  .then(function (result) {
    res.json(true);
  })
  .catch(function (err) {
    return res.status(422).send({
      message: errorHandler.getErrorMessage(err)
    });
  });
};

/**
 * List of Properties
 */
exports.list = function (req, res) {
  var limit = Number(req.query.limit) || 10;
  var page = Number(req.query.page) || 1;
  var keyword = req.query.keyword || null;
  var condition = {};

  if (Date.parse(keyword)) {
    var date = new Date(trim(keyword));
    condition = { $or: [
      { 'men16': date },
      { 'men10': date }
    ] };
  } else if (keyword) {
    var regex = new RegExp(trim(keyword), 'i');
    condition = { $or: [
      { 'men14': regex },
      { 'men17': regex },
      { 'men15': regex },
      { 'men3_1_1': regex },
      { 'men3_1_2': regex }
    ] };
  }
  Property.find(condition)
  .skip((limit * page) - limit)
  .limit(limit)
  .sort('-created').exec(function (err, properties) {
    Property.count(condition).exec(function (err, count) {
      if (err) {
        return res.status(422).send({
          message: errorHandler.getErrorMessage(err)
        });
      } else {
        res.json({
          properties: properties,
          current: page,
          total: count
        });
      }
    });
  });
};

/**
 * Property middleware
 */
exports.propertyByID = function (req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Property is invalid'
    });
  }

  Property.findById(id).exec(function (err, property) {
    if (err) {
      return next(err);
    } else if (!property) {
      return res.status(404).send({
        message: 'No property with that identifier has been found'
      });
    }
    req.property = property;
    next();
  });
};

exports.requestPropertiesMysql = function (req, res) {
  var limit = Number(req.body.limit) || 10;
  var page = Number(req.body.page) || 1;
  var keyword = req.body.keyword || null;
  var query_from = ' FROM v_nice_property_info_1 as inf1 INNER JOIN v_nice_property_info_2 as inf2 ON' +
   ' (inf1.property_id = inf2.property_id) and (inf1.application_id = inf2.application_id)' +
   ' INNER JOIN v_nice_property_no3 as no3 ON (inf1.property_id = no3.property_id) and (inf1.application_id = no3.application_id)';
    // ' INNER JOIN v_nice_property_no4 as no4 ON inf1.property_id = no4.property_id' +
  var query_where = keyword ? ' WHERE inf1.col_015 like ? or inf1.col_012 like ? or inf1.col_005 like ? ' +
   ' or inf1.col_003 like ? or inf1.col_043 like ? or no3.col_148 like ? or no3.col_149 like ?' : '';
  /*
  受付日:col_015
  事前受付番号:col_012
  引受日:col_005
  確認受付番号:col_003
  物件名:col_043
  建築場所都道府県:col_148
  建築場所:col_149^-
  */
  var query_oder = ' ORDER BY inf1.application_id';
  var query_limit = ' LIMIT ?, ?';

  var query_total = 'SELECT count(inf1.application_id) as total' + query_from + query_where;
  var query_select = 'SELECT inf1.application_id, inf1.col_015, inf1.col_012, inf1.col_005, inf1.col_003, inf1.col_043, no3.col_148, no3.col_149' +
   query_from + query_where + query_oder + query_limit;
  var _total;
  // param
  var param = createParam(keyword, (page - 1) * limit, limit);
  mysqlSelect(query_total, param[0])
  .then(function (result_total) {
    _total = result_total[0].total;
    return mysqlSelect(query_select, param[1]);
  })
  .then(function (result_select) {
    res.json({
      list: result_select,
      current: page,
      total: _total
    });
  })
  .catch(function (err) {
    console.log(err);
    return res.status(422).send({
      message: errorHandler.getErrorMessage(err)
    });
  });
};

exports.importPropertyFormMysql = function (req, res) {
  var id = req.body.id;
  var query_from = ' FROM v_nice_property_info_1 as inf1 INNER JOIN v_nice_property_info_2 as inf2' +
   ' ON (inf1.property_id = inf2.property_id) and (inf1.application_id = inf2.application_id)' +
   ' INNER JOIN v_nice_property_no3 as no3' +
   ' ON (inf1.property_id = no3.property_id) and (inf1.application_id = no3.application_id)' +
   ' INNER JOIN v_nice_property_no4 as no4' +
   ' ON (inf1.property_id = no4.property_id) and (inf1.application_id = no4.application_id)';

  var query_where = ' WHERE inf1.application_id = ?';
  var query_select = 'SELECT * ' + query_from + query_where;

  var property;
  var property_floor;
  var newProperty;
  mysqlSelect(query_select, id)
  .then(function (result_property) {
    if (result_property.length === 0) {
      return new Promise(function (resolve, reject) {
        reject({ message: 'application_id dont find' });
      });
    }
    property = result_property[0];
    // get list data floor
    var no4_id = property.no4_id;
    var query_where_floor = ' WHERE no4_id = ? ';
    var query_select_floor = 'SELECT * FROM v_nice_property_floor ' + query_where_floor;
    return mysqlSelect(query_select_floor, no4_id);
  })
  .then(function (result_floor) {
    property_floor = result_floor;
    return listMasterProperties();
  })
  .then(function (masterProperties) {
    return setupImportProperty(property, property_floor, masterProperties);
  })
  .then(function (_property) {
    return res.json(_property);
  })
  .catch(function (err) {
    console.log(err);
    return res.status(422).send({
      message: errorHandler.getErrorMessage(err)
    });
  });
};

function createParam(keyword, page, limit) {
  var param_total = keyword ? _.fill(Array(7), '%' + keyword + '%') : [];
  var param_select = _.concat(param_total, [page, limit]);
  return [param_total, param_select];
}

function mergeInfoProperty(array1, array2) {
  return _.map(array1, function (p) {
    return _.merge(p, _.find(array2, { property_id: p.property_id }));
  });
}

function mysqlSelect(query, param) {
  var pool = mysql.createPool({
    connectionLimit: 1000,
    host: 'localhost',
    user: 'jaic',
    password: 'phHMsxf2',
    database: 'jaic_db'
  });
  return new Promise(function (resolve, reject) {
    pool.getConnection(function (err, connection) {
      if (err) {
        reject(err);
      }
    });

    pool.on('release', function (connection) {
      console.log('Connection %d released', connection.threadId);
    });

    pool.on('enqueue', function () {
      console.log('Waiting for available connection slot');
    });

    pool.query(query, param, function (error, results, fields) {
      if (error) {
        reject(error);
      }
      resolve(results);
    });
  });
}

function setupImportProperty(property, property_floor, masterProperties) {
  return new Promise(function (resolve, reject) {
    var list_floor = getDataFloor4_10(property_floor, property.no4_id);
    checkUpdateOrCreate(property.application_id)
    .then(function (propertyObj) {
      return importProperty(propertyObj, property, masterProperties, list_floor);
    })
    .then(function (result) {
      return resolve(result);
    })
    .catch(function (err) {
      reject(err);
    });
  });
}

function checkUpdateOrCreate(application_id) {
  console.log(application_id);
  return new Promise(function (resolve, reject) {
    Property.findOne({ application_id: application_id }).exec(function (err, property) {
      if (err) {
        reject(err);
      }
      if (property) {
        resolve(property);
      } else {
        resolve();
      }
    });
  });
}

function importProperty(newPro, _property, masterProperties, list_floor) {
  return new Promise(function (resolve, reject) {
    if (!newPro) {
      newPro = new Property();
    }
    // 物件概要
    newPro.application_id = _property.application_id;
    newPro.men10 = _property.col_005;
    newPro.men11 = trim(_property.col_067);
    newPro.men12 = trim(_property.col_070);
    newPro.men13 = trim(_property.col_107);
    newPro.men14 = trim(_property.col_012);
    newPro.men15 = trim(_property.col_043);
    newPro.men16 = trim(_property.col_015);
    newPro.men17 = trim(_property.col_003);
    // 受付日:col_015 = 016
    // 事前受付番号:col_012 = 014
    // 引受日:col_005 = 010
    // 確認受付番号:col_003 = 017
    // 物件名:col_043	= 015
    // 第三面
    newPro.men3_1_1 = trim(_property.col_148);
    newPro.men3_1_2 = trim(_property.col_149);
    newPro.men3_2_1 = trim(_property.col_150);
    newPro.men3_2_2 = trim(_property.col_151);
    newPro.men3_3 = getValueMen3_3(_property);
    newPro.men3_4 = split(_property.col_158);
    newPro.men3_5_1 = getValueMen3_5_1(_property);
    newPro.men3_5_2 = getValueMen3_5_2(_property);
    newPro.men3_5_3 = trim(_property.col_165);
    newPro.men3_6_1 = toFloat(_property.col_166);
    newPro.men3_6_2 = toFloat(_property.col_167);
    // 7.敷地面積
    newPro.men3_7_1.c1 = toFloat(_property.col_169);
    newPro.men3_7_1.c2 = toFloat(_property.col_170);
    newPro.men3_7_1.c3 = toFloat(_property.col_171);
    newPro.men3_7_1.c4 = toFloat(_property.col_172);
    newPro.men3_7_1.c5 = toFloat(_property.col_173);
    newPro.men3_7_1.c6 = toFloat(_property.col_174);
    newPro.men3_7_1.c7 = toFloat(_property.col_175);
    newPro.men3_7_1.c8 = toFloat(_property.col_176);
    // ﾛ.用途地域等
    newPro.men3_7_2.c1 = trim(_property.col_177);
    newPro.men3_7_2.c2 = trim(_property.col_178);
    newPro.men3_7_2.c3 = trim(_property.col_179);
    newPro.men3_7_2.c4 = trim(_property.col_180);
    // ﾊ.建築基準法第52条第１項及び第２項の規定による建築物の容積率
    newPro.men3_7_5.c1 = toFloat(_property.col_181);
    newPro.men3_7_5.c2 = toFloat(_property.col_182);
    newPro.men3_7_5.c3 = toFloat(_property.col_183);
    newPro.men3_7_5.c4 = toFloat(_property.col_184);
    // ﾆ.建築基準法第53条第１項の規定による建築物の建蔽率
    newPro.men3_7_6.c1 = toFloat(_property.col_185);
    newPro.men3_7_6.c2 = toFloat(_property.col_186);
    newPro.men3_7_6.c3 = toFloat(_property.col_187);
    newPro.men3_7_6.c4 = toFloat(_property.col_188);
    // ﾎ.敷地面積の合計
    newPro.men3_7_7 = {
      c1: toFloat(_property.col_189),
      c2: toFloat(_property.col_190)
    };
    // ﾍ.敷地に建築可能な延べ面積を敷地面積で除した数値
    newPro.men3_7_3 = toFloat(_property.col_191);
    // ﾄ.敷地に建築可能な建築面積を敷地面積で除した数値
    newPro.men3_7_4 = toFloat(_property.col_193);
    // 8.主要用途
    newPro.men3_8.c1 = {
      class: getClassFromDivision(_property.col_198),
      division: trim(_property.col_198),
      text: trim(_property.col_199)
    };
    newPro.men3_9 = split(_property.col_201);
    // 10.建築面積
    newPro.men3_10_1 = toFloat(_property.col_209);
    newPro.men3_10_3 = toFloat(_property.col_210);
    newPro.men3_10_4 = toFloat(_property.col_211);
    newPro.men3_10_2 = toFloat(_property.col_212);
    // 11.延べ面積
    newPro.men3_11_1 = toFloat(_property.col_214);
    newPro.men3_11_4 = toFloat(_property.col_215);
    newPro.men3_11_5 = toFloat(_property.col_216);
    // ｦ.延べ面積
    newPro.men3_11_2 = toFloat(_property.col_251);
    // ﾜ.容積率
    newPro.men3_11_3 = toFloat(_property.col_253);
    // ﾛ.地階の住宅又は老人ホーム、福祉ホームその他これらに類するものの部分
    newPro.men3_11_6 = {
      c1: toFloat(_property.col_217),
      c2: toFloat(_property.col_218),
      c3: toFloat(_property.col_219)
    };
    newPro.men3_11_7 = {
      c1: toFloat(_property.col_220),
      c2: toFloat(_property.col_221),
      c3: toFloat(_property.col_222)
    };
    newPro.men3_11_8 = {
      c1: toFloat(_property.col_223),
      c2: toFloat(_property.col_224),
      c3: toFloat(_property.col_225)
    };
    newPro.men3_11_9 = {
      c1: toFloat(_property.col_226),
      c2: toFloat(_property.col_227),
      c3: toFloat(_property.col_228)
    };
    newPro.men3_11_10 = {
      c1: toFloat(_property.col_229),
      c2: toFloat(_property.col_230),
      c3: toFloat(_property.col_231)
    };
    newPro.men3_11_11 = {
      c1: toFloat(_property.col_232),
      c2: toFloat(_property.col_233),
      c3: toFloat(_property.col_234)
    };
    newPro.men3_11_12 = {
      c1: toFloat(_property.col_235),
      c2: toFloat(_property.col_236),
      c3: toFloat(_property.col_237)
    };
    newPro.men3_11_13 = {
      c1: toFloat(_property.col_238),
      c2: toFloat(_property.col_239),
      c3: toFloat(_property.col_240)
    };
    newPro.men3_11_14 = {
      c1: toFloat(_property.col_241),
      c2: toFloat(_property.col_242),
      c3: toFloat(_property.col_243)
    };
    newPro.men3_11_15 = {
      c1: toFloat(_property.col_244),
      c2: toFloat(_property.col_245),
      c3: toFloat(_property.col_246)
    };
    // 12.建築物の数
    newPro.men3_12_1 = toFloat(_property.col_255);
    newPro.men3_12_2 = toFloat(_property.col_256);
    // 13.建築物の高さ等
    newPro.men3_13_1 = toFloat(_property.col_257);
    newPro.men3_13_2 = toFloat(_property.col_258);
    newPro.men3_13_3 = {
      c1: toFloat(_property.col_259),
      c2: toFloat(_property.col_261)
    };
    newPro.men3_13_4 = {
      c1: toFloat(_property.col_260),
      c2: toFloat(_property.col_262)
    };
    newPro.men3_13_5_1 = trim(_property.col_263);
    newPro.men3_13_5_2 = trim(_property.col_264);
    newPro.men3_13_6 = trim(_property.col_265);
    newPro.men3_13_7 = getValueMen3_13_7(_property);
    // 14.許可・認定等
    newPro.men3_14 = trim(_property.col_269);
    // 15.工事着手予定年月日
    newPro.men3_15 = trim(_property.col_270);
    // 16.工事完了予定年月日
    newPro.men3_16 = trim(_property.col_271);
    // 17.特定工程工事終了予定年月日
    newPro.men3_17 = {
      c1: {
        times: toFloat(_property.col_272),
        date: trim(_property.col_273)
      },
      c2: {
        times: toFloat(_property.col_275),
        date: trim(_property.col_276)
      },
      c3: {
        times: toFloat(_property.col_278),
        date: trim(_property.col_279)
      }
    };
    // 18.その他必要な事項
    newPro.men3_18 = trim(_property.col_290);
    // 19.備考
    newPro.men3_19 = trim(_property.col_291);

    // 第四面
    newPro.men4_1 = toFloat(_property.col_292);
    newPro.men4_2.c1 = {
      class: getClassFromDivision(_property.col_294),
      division: trim(_property.col_294),
      text: trim(_property.col_295)
    };
    newPro.men4_2.c2 = {
      class: getClassFromDivision(_property.col_296),
      division: trim(_property.col_296),
      text: trim(_property.col_297)
    };
    newPro.men4_2.c3 = {
      class: getClassFromDivision(_property.col_298),
      division: trim(_property.col_298),
      text: trim(_property.col_299)
    };
    newPro.men4_3 = getValueMen4_3(_property);
    newPro.men4_4 = {
      c1: trim(_property.col_322),
      c2: trim(_property.col_323)
    };
    // 5.耐火建築物等
    newPro.men4_5 = getValueMen4_5(_property);
    // 6.階数
    newPro.men4_6_1 = toFloat(_property.col_333);
    newPro.men4_6_2 = toFloat(_property.col_334);
    newPro.men4_6_3 = toFloat(_property.col_335);
    newPro.men4_6_4 = toFloat(_property.col_336);
    // 7.高さ
    newPro.men4_7_1 = toFloat(_property.col_337);
    newPro.men4_7_2 = toFloat(_property.col_338);
    // 8.建築設備の種類
    newPro.men4_8 = trim(_property.col_339);
    newPro.men4_9_1 = trim(_property.col_340);
    newPro.men4_9_2 = trim(_property.col_341);

    var number_men4_9_3 = 0;
    if (toFloat(_property.col_342) > 0) {
      number_men4_9_3 = 1;
    }
    if (toFloat(_property.col_343) > 0) {
      number_men4_9_3 = 2;
    }
    if (toFloat(_property.col_344) > 0) {
      number_men4_9_3 = 3;
    }
    if (toFloat(_property.col_345) > 0) {
      number_men4_9_3 = 4;
    }
    newPro.men4_9_3 = number_men4_9_3;
    newPro.men4_9_4 = toFloat(_property.col_346);
    newPro.men4_9_5 = getValueMen4_9_5(_property);
    newPro.men4_9_6 = toFloat(_property.col_349);
    // 10.床 面 積
    newPro.men4_10_1 = 0;
    newPro.men4_10_2 = toFloat(_property.col_350);
    newPro.men4_10_3 = toFloat(_property.col_351);
    newPro.men4_10_4 = toFloat(_property.col_352);
    newPro.men4_10_5 = [];
    if (list_floor.length > 0) {
      var total_c1 = 0;
      list_floor.forEach(function (f) {
        newPro.men4_10_5.push(
          {
            c0: getValueMen4_10_floor(f.f_001),
            c1: toFloat(f.f_002),
            c2: toFloat(f.f_004),
            c3: toFloat(f.f_005),
            c4: toFloat(f.f_006)
          }
        );
        total_c1 += toFloat(f.f_002);
      });
      newPro.men4_10_1 = total_c1;
    }
    newPro.men4_11 = trim(_property.col_353);
    newPro.men4_12 = trim(_property.col_354);
    newPro.men4_13 = trim(_property.col_355);
    newPro.men4_14 = trim(_property.col_356);
    newPro.men4_15 = getValueMen4_15(_property);
    newPro.men4_16 = trim(_property.col_364);
    newPro.men4_17 = trim(_property.col_365);

    newPro.save(function (err, result) {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
}


function trim(string) {
  if (!string) { return ''; }
  return string.trim();
}

function getChild(value, param) {
  if (!value || !value[param]) return 0;
  return parseFloat(value[param]);
}

function toFloat(string) {
  if (!string) { return 0; }
  return parseFloat(string);
}

function percent(number) {
  var factor = Math.pow(10, 2);
  number = Math.ceil(number * 100 * factor) / factor;
  return number;
}

function split(string) {
  return string.replace(/^\s+|\s+$/g, '').split(/\s*,\s*/);
}

// method create data for form
function getValueMen3_3(_property) {
  var out = [];
  if (_property.col_152 === '1') { out.push('都市計画区域内'); }
  if (_property.col_153 === '1') { out.push('市外化区域'); }
  if (_property.col_154 === '1') { out.push('市街化調整区域'); }
  if (_property.col_155 === '1') { out.push('区域区分非設定'); }
  if (_property.col_156 === '1') { out.push('準都市計画区域内'); }
  if (_property.col_157 === '1') { out.push('都市計画区域及び準都市計画区域外'); }
  return out;
}

function getValueMen3_5_1(_property) {
  var out = [];
  if (_property.col_162 === '1') { out.push('内'); }
  if (_property.col_163 === '1') { out.push('外'); }
  return out;
}

function getValueMen3_5_2(_property) {
  var out = [];
  if (_property.col_164 === '1') { out.push('内'); }
  return out;
}

function percentRoundLogic(input, c1, c2) {
  // =IF(AB271,ROUNDUP(BE280/AB271,4),IF(AB272,ROUNDUP(BE280/AB272,4),""))
  // men3_7_7 ﾎ.敷地面積の合計
  if (c1) {
    return percent(input / c1);
  } else if (c2) {
    return percent(input / c2);
  }
  return 0;
}

function getValueMen3_13_7(_property) {
  var out = [];
  if (_property.col_266 === '1') { out.push('道路高さ制限不適用'); }
  if (_property.col_267 === '1') { out.push('隣地高さ制限不適用'); }
  if (_property.col_268 === '1') { out.push('北側高さ制限不適用'); }
  return out;
}

function getValueMen4_3(_property) {
  var out = [];
  if (_property.col_314 === '1') { out.push('新築'); }
  if (_property.col_315 === '1') { out.push('増築'); }
  if (_property.col_316 === '1') { out.push('改築'); }
  if (_property.col_317 === '1') { out.push('移転'); }
  if (_property.col_318 === '1') { out.push('用途変更'); }
  if (_property.col_319 === '1') { out.push('大規模の修繕'); }
  if (_property.col_320 === '1') { out.push('大規模の模様替'); }
  if (_property.col_231 === '1') { out.push('建築設備の設置'); }
  return out;
}

function getValueMen4_5(_property) {
  var out = [];
  if (_property.col_324 === '1') { out.push('耐火建築物'); }
  if (_property.col_325 === '1') { out.push('準耐火建築物（ｲ-1）'); }
  if (_property.col_326 === '1') { out.push('準耐火建築物（ｲ-2）'); }
  if (_property.col_327 === '1') { out.push('準耐火建築物（ﾛ-1）'); }
  if (_property.col_328 === '1') { out.push('準耐火建築物（ﾛ-2）'); }
  if (_property.col_329 === '1') { out.push('耐火構造建築物'); }
  if (_property.col_330 === '1') { out.push('特定避難時間倒壊等防止建築物'); }
  if (_property.col_331 === '1') { out.push('その他'); }
  return out;
}

function getValueMen4_9_5(_property) {
  var out = [];
  if (_property.col_347 === '1') { out.push('建築基準法施行令第136条の2の11第1号イ'); }
  if (_property.col_348 === '1') { out.push('建築基準法施行令第136条の2の11第1号ロ'); }
  return out;
}

function getValueMen4_15(_property) {
  var out = [];
  if (_property.col_357 === '1') { out.push('水洗'); }
  if (_property.col_358 === '1') { out.push('公共下水'); }
  if (_property.col_359 === '1') { out.push('団地内浄化槽'); }
  if (_property.col_360 === '1') { out.push('農村下水道'); }
  if (_property.col_361 === '1') { out.push('汲取り'); }
  if (_property.col_362 === '1') { out.push('汲取り（改良）'); }
  return out;
}

function listMasterProperties() {
  return new Promise(function (resolve, reject) {
    MasterProperties.find({
      use_flag: 'TRUE'
    }).exec(function (err, masterProperties) {
      if (err) {
        reject(err);
      }
      return resolve(masterProperties);
    });
  });
}

function getClassFromDivision(division) {
  var json = [
    { 'name': '不特定・多数（集中）系', 'child': ['08530', '08540', '08550'] },
    { 'name': '宿泊・就寝系', 'child': ['08030', '08040', '08050', '08170', '08180', '08190', '08210', '08240', '08260', '08400'] },
    { 'name': '特定・多数系', 'child': ['08070', '08080', '08082', '08090', '08100', '08110', '08120', '08130', '08132', '08140', '08150', '08370', '08380'] },
    { 'name': '不特定・多数系', 'child': ['08230', '08390', '08438', '08440', '08450', '08452', '08560', '08570', '08580', '08590', '08600'] },
    { 'name': '火災荷重大系', 'child': ['08510', '08520'] },
    { 'name': '火災危険大系', 'child': ['08350', '08480', '08490'] },
    { 'name': '住宅系', 'child': ['08010', '08020', '08060'] },
    { 'name': '事務所系', 'child': ['08160', '08270', '08280', '08290', '08300', '08310', '08330', '08470'] },
    { 'name': 'サービス系', 'child': ['08250', '08456', '08458', '08460'] },
    { 'name': '工場系', 'child': ['08340', '08360', '08410', '08420', '08430'] },
    { 'name': 'その他', 'child': ['08320', '08500', '08610', '08620', '08990'] }
  ];
  var classValue = '';
  json.forEach(function (item) {
    if (classValue === '') {
      item.child.forEach(function (id) {
        if (id === trim(division)) {
          classValue = item.name;
        }
      });
    }
  });
  return trim(classValue);
}


function getDataFloor4_10(property_floor, no4_id) {
  return _.filter(property_floor, { no4_id: parseInt(no4_id, 10) });
}

function getValueMen4_10_floor(f_001) {
  var out = '';
  if (f_001 === '1') { out = ('F'); }
  if (f_001 === '2') { out = ('B'); }
  if (f_001 === '3') { out = ('P'); }
  if (f_001 === '4') { out = ('M'); }
  return out;
}

exports.listMasterCheckSheetForm4 = function (req, res) {
  MasterCheckSheetForm4.find().exec(function (err, list) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    }

    res.json(list);
  });
};

exports.listMasterCheckSheetForm7 = function (req, res) {
  MasterCheckSheetForm7.find().exec(function (err, list) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    }

    res.json(list);
  });
};
