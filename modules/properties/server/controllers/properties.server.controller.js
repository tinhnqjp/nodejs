'use strict';

/**
 * Module dependencies
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Doc = mongoose.model('Doc'),
  Property = mongoose.model('Property'),
  MasterProperties = mongoose.model('MasterProperties'),
  _ = require('lodash'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

/**
 * Create an property
 */
exports.create = function (req, res) {
  var doc = new Doc();
  doc.save();
  var property = new Property(req.body);
  property.doc = doc;

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

/**
 * Delete an property
 */
exports.delete = function (req, res) {
  var property = req.property;

  property.remove(function (err) {
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
 * List of Properties
 */
exports.list = function (req, res) {
  var limit = Number(req.query.limit) || 10;
  var page = Number(req.query.page) || 1;
  Property.find()
  .skip((limit * page) - limit)
  .limit(limit)
  .sort('-created').exec(function (err, properties) {
    Property.count().exec(function (err, count) {
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

exports.requestPropertyByDoc = function (req, res) {
  var doc = req.body.doc;
  Property.findOne({ doc: doc }).exec(function (err, property) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    }

    res.json(property);
  });
};

var property_no3 = [{ 'property_id': '1', 'application_id': '1', 'col_148': '\u795e\u5948\u5ddd\u770c ', 'col_149': '\u539a\u6728\u5e02\u98ef\u5c71\u5b57\u53e4\u677e\u4e0a2166\u756a8', 'col_150': '\u795e\u5948\u5ddd\u770c ', 'col_151': '\u539a\u6728\u5e02\u98ef\u5c712166',
  'col_152': '1', 'col_153': '1', 'col_154': '0', 'col_155': '0', 'col_156': '0', 'col_157': '0',
  'col_158': '準防火地域,準防火地域', 'col_159': '0', 'col_160': '1', 'col_161': '0', 'col_162': '0', 'col_163': '1', 'col_164': null, 'col_165': '\u4e0b\u6c34\u9053\u51e6\u7406\u533a\u57df\u3000\u65e5\u5f71\u898f\u52364h\/2.5h-4.0m\u3000\u666f\u89b3\u8a08\u753b\u533a\u57df', 'col_166': '12.000', 'col_167': null, 'col_168': '8.500', 'col_169': '165.43', 'col_170': null, 'col_171': null, 'col_172': null, 'col_173': null, 'col_174': null, 'col_175': null, 'col_176': null,
  'col_177': '\u7b2c\u4e00\u7a2e\u4e2d\u9ad8\u5c64\u4f4f\u5c45\u5c02\u7528\u5730\u57df', 'col_178': null, 'col_179': null, 'col_180': null, 'col_181': '200.00', 'col_182': null, 'col_183': null, 'col_184': null, 'col_185': '60.00', 'col_186': null, 'col_187': null, 'col_188': null, 'col_189': '165.43', 'col_190': null, 'col_191': '200.00', 'col_192': '0', 'col_193': '60.00', 'col_194': '0', 'col_195': '0', 'col_196': '0', 'col_197': null, 'col_198': '08010     ', 'col_199': '\u4e00\u6238\u5efa\u3066\u306e\u4f4f\u5b85', 'col_200': null, 'col_201': '\u65b0\u7bc9 ', 'col_202': '1', 'col_203': '0', 'col_204': '0', 'col_205': '0', 'col_206': '0', 'col_207': '0', 'col_208': '0', 'col_209': '57.96', 'col_210': null, 'col_211': '57.96', 'col_212': '35.04', 'col_213': '0', 'col_214': '97.29', 'col_215': null, 'col_216': '97.29', 'col_217': null, 'col_218': null, 'col_219': null, 'col_220': null, 'col_221': null, 'col_222': null, 'col_223': null, 'col_224': null, 'col_225': null, 'col_226': null, 'col_227': null, 'col_228': null, 'col_229': null, 'col_230': null, 'col_231': null, 'col_232': null, 'col_233': null, 'col_234': null, 'col_235': null, 'col_236': null, 'col_237': null, 'col_238': null, 'col_239': null, 'col_240': null, 'col_241': '97.29', 'col_242': null, 'col_243': '97.29', 'col_244': null, 'col_245': null, 'col_246': null, 'col_247': null, 'col_248': null, 'col_249': null, 'col_250': null, 'col_251': '97.29', 'col_252': '0', 'col_253': '58.82', 'col_254': '0', 'col_255': '1', 'col_256': '0', 'col_257': '7.930', 'col_258': null, 'col_259': '2', 'col_260': null, 'col_261': '0', 'col_262': null, 'col_263': '\u6728\u9020', 'col_264': null, 'col_265': '0', 'col_266': '1', 'col_267': '0', 'col_268': '0', 'col_269': null, 'col_270': '2017\/11\/01', 'col_271': '2018\/02\/25', 'col_272': null, 'col_273': null, 'col_274': null, 'col_275': null, 'col_276': null, 'col_277': null, 'col_278': null, 'col_279': null, 'col_280': null, 'col_281': null, 'col_282': null, 'col_283': null, 'col_284': null, 'col_285': null, 'col_286': null, 'col_287': null, 'col_288': null, 'col_289': null, 'col_290': '\u4f4f\u5b85\u7528\u706b\u707d\u8b66\u5831\u5668\u3000\u5efa\u7bc9\u4e3b\u306e\u5c45\u4f4f\u306e\u7528\u306b\u4f9b\u3059\u308b\u4e00\u6238\u5efa\u3066\u306e\u4f4f\u5b85', 'col_291': null },
{ 'property_id': '2', 'application_id': '2', 'col_148': '\u6771\u4eac\u90fd  ', 'col_149': '\u72db\u6c5f\u5e02\u5143\u548c\u6cc92\u4e01\u76ee2148-1\u30012145-2\u30012146-2', 'col_150': '\u6771\u4eac\u90fd  ', 'col_151': '\u72db\u6c5f\u5e02\u5143\u548c\u6cc92\u4e01\u76ee14\u203b\u679d\u756a\u672a\u5b9a',
  'col_152': '1', 'col_153': '1', 'col_154': '0', 'col_155': '0', 'col_156': '0', 'col_157': '0',
  'col_158': '準防火地域,指定なし', 'col_159': '0', 'col_160': '1', 'col_161': '0', 'col_162': '0', 'col_163': '1', 'col_164': null, 'col_165': '\u4e0b\u6c34\u9053\u533a\u57df\u300125m\u7b2c2\u7a2e\u9ad8\u5ea6\u5730\u533a(\u4e00\u4f4f)\u3001\u7b2c\u4e00\u7a2e\u9ad8\u5ea6\u5730\u533a(\u4e00\u4f4e)\u3001\u548c\u6cc9\u591a\u6469\u5ddd\u7dd1\u5730\u533a\u57df\u5185\u3001\u65e5\u5f71\u898f\u52364h\/2.5-4m(\u4e00\u4f4f)\u30013h\/2h-1.5m(\u4e00\u4f4e)\u3001\u6700\u4f4e\u6577\u5730100\u33a1\u7d76\u5bfe\u9ad8\u305510m(\u4e00\u4f4e)', 'col_166': '15.980', 'col_167': null, 'col_168': '24.480', 'col_169': '495.69', 'col_170': '47.31', 'col_171': null, 'col_172': null, 'col_173': null, 'col_174': null, 'col_175': null, 'col_176': null, 'col_177': '\u7b2c\u4e00\u7a2e\u4f4f\u5c45\u5730\u57df', 'col_178': '\u7b2c\u4e00\u7a2e\u4f4e\u5c64\u4f4f\u5c45\u5c02\u7528\u5730\u57df', 'col_179': null, 'col_180': null, 'col_181': '200.00', 'col_182': '80.00', 'col_183': null, 'col_184': null, 'col_185': '60.00', 'col_186': '40.00', 'col_187': null, 'col_188': null, 'col_189': '543.00', 'col_190': null, 'col_191': '189.54', 'col_192': '0', 'col_193': '68.25', 'col_194': '1', 'col_195': '0', 'col_196': '0', 'col_197': null, 'col_198': '08520     ', 'col_199': '\u81ea\u5bb6\u7528\u5009\u5eab(\u5009\u5eab\u696d\u3092\u55b6\u307e\u306a\u3044\u5009\u5eab)', 'col_200': null, 'col_201': '\u65b0\u7bc9 ', 'col_202': '1', 'col_203': '0', 'col_204': '0', 'col_205': '0', 'col_206': '0', 'col_207': '0', 'col_208': '0', 'col_209': '348.00', 'col_210': null, 'col_211': '348.00', 'col_212': '64.09', 'col_213': '0', 'col_214': '1044.00', 'col_215': null, 'col_216': '1044.00', 'col_217': null, 'col_218': null, 'col_219': null, 'col_220': '18.15', 'col_221': null, 'col_222': '18.15', 'col_223': null, 'col_224': null, 'col_225': null, 'col_226': null, 'col_227': null, 'col_228': null, 'col_229': null, 'col_230': null, 'col_231': null, 'col_232': null, 'col_233': null, 'col_234': null, 'col_235': null, 'col_236': null, 'col_237': null, 'col_238': null, 'col_239': null, 'col_240': null, 'col_241': null, 'col_242': null, 'col_243': null, 'col_244': null, 'col_245': null, 'col_246': null, 'col_247': null, 'col_248': null, 'col_249': null, 'col_250': null, 'col_251': '1025.85', 'col_252': '0', 'col_253': '188.93', 'col_254': '0', 'col_255': '1', 'col_256': '0', 'col_257': '9.440', 'col_258': null, 'col_259': '3', 'col_260': null, 'col_261': '0', 'col_262': null, 'col_263': '\u9244\u9aa8\u9020', 'col_264': null, 'col_265': '0', 'col_266': '0', 'col_267': '0', 'col_268': '0', 'col_269': '\u4f4d\u7f6e\u6307\u5b9a\u9053\u8def\u3000\u6307\u5b9a\u5e74\u6708\u65e5\u3000\u662d\u548c43\u5e7412\u67084\u65e5\u3000\u7b2c\u5317\u5357\u5efa\u53ce\u7b2c61\u53f7\u3000\u5e45\u54e14.0m\u3000\u5ef6\u957735.00m\r\n\u90fd\u5e02\u8a08\u753b\u6cd5\u7b2c53\u6761\u8a31\u53ef\u3000\u72db\u90fd\u307e\u767a\u7b2c000576\u53f7\u3000\u5e73\u621029\u5e7411\u67088\u65e5', 'col_270': '2017\/12\/30', 'col_271': '2018\/05\/21', 'col_272': null, 'col_273': '2018\/01\/30', 'col_274': '1\u968e\u306e\u9244\u9aa8\u5efa\u3066\u65b9\u5de5\u4e8b\u5b8c\u4e86\u6642', 'col_275': null, 'col_276': null, 'col_277': null, 'col_278': null, 'col_279': null, 'col_280': null, 'col_281': null, 'col_282': null, 'col_283': null, 'col_284': null, 'col_285': null, 'col_286': null, 'col_287': null, 'col_288': null, 'col_289': null, 'col_290': null, 'col_291': null }];
var property_no4 = [{ 'property_id': '1', 'application_id': '1', 'no4_id': '1', 'col_292': '1', 'col_293': null, 'col_294': null, 'col_295': null, 'col_296': null, 'col_297': null, 'col_298': null, 'col_299': null, 'col_300': null, 'col_301': null, 'col_302': null, 'col_303': null, 'col_304': null, 'col_305': null, 'col_306': null, 'col_307': null, 'col_308': null, 'col_309': null, 'col_310': null, 'col_311': null, 'col_312': null, 'col_313': null, 'col_314': '0', 'col_315': '0', 'col_316': '0', 'col_317': '0', 'col_318': '0', 'col_319': '0', 'col_320': '0', 'col_321': null, 'col_322': null, 'col_323': null, 'col_324': '0', 'col_325': '0', 'col_326': '0', 'col_327': '0', 'col_328': '0', 'col_329': '0', 'col_330': '0', 'col_331': '0', 'col_332': null, 'col_333': null, 'col_334': null, 'col_335': null, 'col_336': null, 'col_337': null, 'col_338': null, 'col_339': null, 'col_340': null, 'col_341': '1', 'col_342': '0', 'col_343': '0', 'col_344': '0', 'col_345': '1', 'col_346': null, 'col_347': '0', 'col_348': '0', 'col_349': null, 'col_350': null, 'col_351': null, 'col_352': null, 'col_353': null, 'col_354': null, 'col_355': null, 'col_356': null, 'col_357': '0', 'col_358': '0', 'col_359': '0', 'col_360': '0', 'col_361': '0', 'col_362': '0', 'col_363': null, 'col_364': null, 'col_365': null },
{ 'property_id': '2', 'application_id': '2', 'no4_id': '2', 'col_292': '1', 'col_293': null, 'col_294': '08520     ', 'col_295': '\u5009\u5eab\u696d\u3092\u55b6\u307e\u306a\u3044\u5009\u5eab', 'col_296': null, 'col_297': null, 'col_298': null, 'col_299': null, 'col_300': null, 'col_301': null, 'col_302': null, 'col_303': null, 'col_304': null, 'col_305': null, 'col_306': null, 'col_307': null, 'col_308': null, 'col_309': null, 'col_310': null, 'col_311': null, 'col_312': null, 'col_313': null, 'col_314': '1', 'col_315': '0', 'col_316': '0', 'col_317': '0', 'col_318': '0', 'col_319': '0', 'col_320': '0', 'col_321': null, 'col_322': '\u9244\u9aa8\u9020', 'col_323': null, 'col_324': '0', 'col_325': '0', 'col_326': '0', 'col_327': '0', 'col_328': '0', 'col_329': '0', 'col_330': '0', 'col_331': '0', 'col_332': null, 'col_333': '3', 'col_334': '0', 'col_335': null, 'col_336': null, 'col_337': '9.440', 'col_338': null, 'col_339': null, 'col_340': null, 'col_341': '0', 'col_342': '0', 'col_343': '0', 'col_344': '0', 'col_345': '0', 'col_346': null, 'col_347': '0', 'col_348': '0', 'col_349': null, 'col_350': null, 'col_351': null, 'col_352': null, 'col_353': null, 'col_354': null, 'col_355': null, 'col_356': null, 'col_357': '0', 'col_358': '0', 'col_359': '0', 'col_360': '0', 'col_361': '0', 'col_362': '0', 'col_363': null, 'col_364': null, 'col_365': null }];
var property_info_1 = [{ 'property_id': '1', 'application_id': '1', 'col_001': '1', 'col_002': '1', 'col_003': 'JAIC2017X0137A1               ', 'col_004': 'JAIC2017X0137A1               ', 'col_005': '2017\/11\/07', 'col_006': '2017\/11\/20', 'col_007': '2017\/11\/20', 'col_008': '\u6e0b\u8c37\u652f\u5e97                                              ', 'col_009': null, 'col_010': null, 'col_011': null, 'col_012': 'JAIC2017K0246A1               ', 'col_013': 'JAIC2017X0137A1               ', 'col_014': 'JAIC2017X0137A1               ', 'col_015': '2017\/10\/24', 'col_016': '2017\/11\/07', 'col_017': '2017\/11\/16', 'col_018': '2017\/11\/20', 'col_019': '2017\/11\/20', 'col_020': '\u6a4b\u672c\u3000\u91cd\u4fe1', 'col_021': null, 'col_022': null, 'col_023': null, 'col_024': null, 'col_025': null, 'col_026': null, 'col_027': null, 'col_028': null, 'col_029': null, 'col_030': null, 'col_031': null, 'col_032': null, 'col_033': null, 'col_034': null, 'col_035': null, 'col_036': null, 'col_037': null, 'col_038': '\u7530\u6751\u3000\u572d', 'col_039': null, 'col_040': null, 'col_041': null, 'col_042': null, 'col_043': '\u5ddd\u702c\u8c4a\u69d8B\u68df\u91cd\u5c64\u9577\u5c4b\u65b0\u7bc9\u5de5\u4e8b', 'col_044': '2017\/11\/10', 'col_045': '\u5c0f\u7530\u539f\u5e02\u6d88\u9632\u672c\u90e8', 'col_046': '1', 'col_047': null, 'col_048': null, 'col_049': null, 'col_050': null, 'col_051': '1', 'col_052': '\u795e\u5948\u5ddd\u770c', 'col_053': '\u5c0f\u7530\u539f\u5e02                                                                                                                                                                                                    ', 'col_054': null, 'col_055': null, 'col_056': '23000.0000', 'col_057': '2017\/10\/24', 'col_058': '23000.0000' },
{ 'property_id': '2', 'application_id': '2', 'col_001': '1', 'col_002': '1', 'col_003': 'JAIC2017X0075A1               ', 'col_004': 'JAIC2017X0075A1               ', 'col_005': '2017\/10\/25', 'col_006': '2017\/11\/01', 'col_007': '2017\/11\/01', 'col_008': '\u6e0b\u8c37\u652f\u5e97                                              ', 'col_009': null, 'col_010': null, 'col_011': null, 'col_012': 'JAIC2017K0020A1               ', 'col_013': 'JAIC2017X0075A1               ', 'col_014': 'JAIC2017X0075A1               ', 'col_015': '2017\/10\/04', 'col_016': '2017\/10\/25', 'col_017': '2017\/11\/10', 'col_018': '2017\/11\/01', 'col_019': '2017\/11\/01', 'col_020': '\u6a4b\u672c\u3000\u91cd\u4fe1', 'col_021': null, 'col_022': null, 'col_023': null, 'col_024': null, 'col_025': null, 'col_026': null, 'col_027': null, 'col_028': null, 'col_029': null, 'col_030': null, 'col_031': null, 'col_032': null, 'col_033': null, 'col_034': null, 'col_035': null, 'col_036': null, 'col_037': null, 'col_038': '\u4e95\u53e3\u3000\u91cc\u6c99', 'col_039': '\u753a\u7530\u3000\u85ab', 'col_040': null, 'col_041': '2017\/10\/11', 'col_042': '2017\/10\/12', 'col_043': '\u5944\u7f8e\uff0829\uff09\u5bbf\u820e\uff08\u5944\u7f8e\u5730\u533a\uff09\u65b0\u8a2d\u5efa\u7bc9\u5de5\u4e8b\uff08\u4eee\u8a2d\u4f5c\u696d\u54e1\u5bbf\u820e\uff09', 'col_044': '2017\/10\/31', 'col_045': '\u5927\u5cf6\u5730\u533a\u6d88\u9632\u7d44\u5408\u6d88\u9632\u672c\u90e8', 'col_046': '1', 'col_047': null, 'col_048': null, 'col_049': null, 'col_050': null, 'col_051': '9', 'col_052': '\u9e7f\u5150\u5cf6\u770c', 'col_053': '\u5927\u5cf6\u90e1\u9f8d\u90f7\u753a                                                                                                                                                                                                  ', 'col_054': null, 'col_055': null, 'col_056': '150000.0000', 'col_057': '2017\/10\/04', 'col_058': '150000.0000' }];
var property_info_2 = [{ 'property_id': '1', 'application_id': '1', 'col_059': null, 'col_060': '\u30a2\u30aa\u30ad\u3000\u30d2\u30ed\u30df', 'col_061': null, 'col_062': '\u9752\u6728\u3000\u6d0b\u6d77', 'col_063': '243-0213', 'col_064': '\u795e\u5948\u5ddd\u770c ', 'col_065': '\u539a\u6728\u5e02\u98ef\u5c712381-5\u3000\u30ea\u30fb\u30d5\u30a1\u30df\u30fc\u30eb203', 'col_066': '090-5494-2801', 'col_067': null, 'col_068': '\uff71\uff75\uff77\u3000\uff8b\uff9b\uff90', 'col_069': null, 'col_070': '\u9752\u6728\u3000\u6d0b\u6d77', 'col_071': '243-0213', 'col_072': '\u795e\u5948\u5ddd\u770c ', 'col_073': '\u539a\u6728\u5e02\u98ef\u5c71\uff12\uff13\uff18\uff11\uff0d\uff15\u3000\u30ea\u30fb\u30d5\u30a1\u30df\u30fc\u30eb\uff12\uff10\uff13', 'col_074': '090-5494-2801', 'col_075': null, 'col_076': null, 'col_077': null, 'col_078': null, 'col_079': null, 'col_080': null, 'col_081': null, 'col_082': null, 'col_083': null, 'col_084': null, 'col_085': null, 'col_086': null, 'col_087': null, 'col_088': null, 'col_089': null, 'col_090': null, 'col_091': '\u4e8c\u7d1a', 'col_092': '\u795e\u5948\u5ddd\u770c\u77e5\u4e8b', 'col_093': '30434', 'col_094': '\u5927\u4e45\u4fdd\u3000\u6b66\u53f2', 'col_095': '\u4e8c\u7d1a', 'col_096': '\u795e\u5948\u5ddd\u770c', 'col_097': '10839', 'col_098': '\u30bf\u30a4\u30bb\u30fc\u30cf\u30a6\u30b8\u30f3\u30b0\u682a\u5f0f\u4f1a\u793e\u3000\u4e8c\u7d1a\u5efa\u7bc9\u58eb\u4e8b\u52d9\u6240', 'col_099': '243-0018', 'col_100': '\u795e\u5948\u5ddd\u770c ', 'col_101': '\u539a\u6728\u5e02\u4e2d\u753a4-16-6', 'col_102': '046-244-4888', 'col_103': null, 'col_104': '\u4e8c\u7d1a', 'col_105': '\u795e\u5948\u5ddd\u770c\u77e5\u4e8b', 'col_106': '30434', 'col_107': '\u5927\u4e45\u4fdd\u3000\u6b66\u53f2', 'col_108': '\u4e8c\u7d1a', 'col_109': '\u795e\u5948\u5ddd\u770c', 'col_110': '10839', 'col_111': '\u30bf\u30a4\u30bb\u30fc\u30cf\u30a6\u30b8\u30f3\u30b0\u682a\u5f0f\u4f1a\u793e\u3000\u4e8c\u7d1a\u5efa\u7bc9\u58eb\u4e8b\u52d9\u6240', 'col_112': '243-0018', 'col_113': '\u795e\u5948\u5ddd\u770c ', 'col_114': '\u539a\u6728\u5e02\u4e2d\u753a4-16-6', 'col_115': '046-244-4888', 'col_116': null, 'col_117': null, 'col_118': null, 'col_119': null, 'col_120': null, 'col_121': null, 'col_122': null, 'col_123': null, 'col_124': null, 'col_125': null, 'col_126': null, 'col_127': null, 'col_128': '\u4e8c\u7d1a', 'col_129': '\u795e\u5948\u5ddd\u770c\u77e5\u4e8b', 'col_130': '30434', 'col_131': '\u5927\u4e45\u4fdd\u3000\u6b66\u53f2', 'col_132': '\u4e8c\u7d1a', 'col_133': '\u795e\u5948\u5ddd\u770c', 'col_134': '10839', 'col_135': '\u30bf\u30a4\u30bb\u30fc\u30cf\u30a6\u30b8\u30f3\u30b0\u682a\u5f0f\u4f1a\u793e\u3000\u4e8c\u7d1a\u5efa\u7bc9\u58eb\u4e8b\u52d9\u6240', 'col_136': '243-0018', 'col_137': '\u795e\u5948\u5ddd\u770c ', 'col_138': '\u539a\u6728\u5e02\u4e2d\u753a4-16-6', 'col_139': '046-244-4888', 'col_140': '\u4ee3\u8868\u53d6\u7de0\u5f79\u3000\u5927\u4e45\u4fdd\u3000\u6b66\u53f2', 'col_141': '\u795e\u5948\u5ddd\u770c\u77e5\u4e8b', 'col_142': '76615', 'col_143': '\u30bf\u30a4\u30bb\u30fc\u30cf\u30a6\u30b8\u30f3\u30b0\u682a\u5f0f\u4f1a\u793e', 'col_144': '243-0018', 'col_145': '\u795e\u5948\u5ddd\u770c ', 'col_146': '\u539a\u6728\u5e02\u4e2d\u753a4-16-6', 'col_147': '046-244-4888' },
{ 'property_id': '2', 'application_id': '2', 'col_059': '\u30a8\u30ea\u30a2\u30ea\u30f3\u30af\u682a\u5f0f\u4f1a\u793e', 'col_060': '\uff8a\uff94\uff7c \uff85\uff75\uff90\uff81', 'col_061': '\u4ee3\u8868\u53d6\u7de0\u5f79', 'col_062': '\u6797\u3000\u5c1a\u9053', 'col_063': '101-0021', 'col_064': '\u6771\u4eac\u90fd  ', 'col_065': '\u5343\u4ee3\u7530\u533a\u5916\u795e\u75304-14-1\u3000\u79cb\u8449\u539fUDX\u30d3\u30eb\u5317\u30a6\u30a3\u30f3\u30b020F', 'col_066': '03-3526-8566', 'col_067': '\u30a8\u30ea\u30a2\u30ea\u30f3\u30af\u682a\u5f0f\u4f1a\u793e', 'col_068': null, 'col_069': '\u4ee3\u8868\u53d6\u7de0\u5f79', 'col_070': '\u6797\u3000\u5c1a\u9053', 'col_071': null, 'col_072': null, 'col_073': null, 'col_074': null, 'col_075': null, 'col_076': null, 'col_077': null, 'col_078': null, 'col_079': null, 'col_080': null, 'col_081': null, 'col_082': null, 'col_083': null, 'col_084': null, 'col_085': null, 'col_086': null, 'col_087': null, 'col_088': null, 'col_089': null, 'col_090': null, 'col_091': '\u4e00\u7d1a', 'col_092': '\u56fd\u571f\u4ea4\u901a\u5927\u81e3', 'col_093': '347431', 'col_094': '\u4ee3\u8868\u53d6\u7de0\u5f79\u3000\u98ef\u7530\u3000\u4e00\u5f18', 'col_095': '\u4e00\u7d1a', 'col_096': '\u6771\u4eac\u90fd', 'col_097': '60670', 'col_098': '\u6709\u9650\u4f1a\u793e\u30ef\u30f3\u30c0\u30fc\u30b9\u30bf\u30b8\u30aa', 'col_099': '101-0044', 'col_100': '\u6771\u4eac\u90fd  ', 'col_101': '\u5343\u4ee3\u7530\u533a\u935b\u51b6\u753a2-1-2\u3000\u795e\u7530\u92ed\u5149\u30d3\u30eb6F', 'col_102': '03-6206-9011', 'col_103': null, 'col_104': '\u4e00\u7d1a', 'col_105': '\u56fd\u571f\u4ea4\u901a\u5927\u81e3', 'col_106': '347431', 'col_107': '\u4ee3\u8868\u53d6\u7de0\u5f79\u3000\u98ef\u7530\u3000\u4e00\u5f18', 'col_108': '\u4e00\u7d1a', 'col_109': '\u6771\u4eac\u90fd', 'col_110': '60670', 'col_111': '\u6709\u9650\u4f1a\u793e\u30ef\u30f3\u30c0\u30fc\u30b9\u30bf\u30b8\u30aa', 'col_112': '101-0044', 'col_113': '\u6771\u4eac\u90fd  ', 'col_114': '\u5343\u4ee3\u7530\u533a\u935b\u51b6\u753a2-1-2\u3000\u795e\u7530\u92ed\u5149\u30d3\u30eb6F', 'col_115': '03-6206-9011', 'col_116': '\u4e00\u7d1a', 'col_117': '\u5efa\u8a2d\u5927\u81e3', 'col_118': '220434', 'col_119': '\u5c0f\u6797\u3000\u662d\u4ee3', 'col_120': '\u4e00\u7d1a', 'col_121': '\u6771\u4eac\u90fd', 'col_122': '46313', 'col_123': '\u682a\u5f0f\u4f1a\u793e\u30a2\u30c8\u30e9\u30b9\u8a2d\u8a08\u4e00\u7d1a\u5efa\u7bc9\u58eb\u4e8b\u52d9\u6240', 'col_124': '151-0061', 'col_125': '\u6771\u4eac\u90fd  ', 'col_126': '\u6e0b\u8c37\u533a\u521d\u53f01-34-14', 'col_127': '03-6276-1898', 'col_128': '\u4e00\u7d1a', 'col_129': '\u56fd\u571f\u4ea4\u901a\u5927\u81e3', 'col_130': '347431', 'col_131': '\u4ee3\u8868\u53d6\u7de0\u5f79\u3000\u98ef\u7530\u3000\u4e00\u5f18', 'col_132': '\u4e00\u7d1a', 'col_133': '\u6771\u4eac\u90fd', 'col_134': '60670', 'col_135': '\u6709\u9650\u4f1a\u793e\u30ef\u30f3\u30c0\u30fc\u30b9\u30bf\u30b8\u30aa', 'col_136': '101-0044', 'col_137': '\u6771\u4eac\u90fd  ', 'col_138': '\u5343\u4ee3\u7530\u533a\u935b\u51b6\u753a2-1-2\u3000\u795e\u7530\u92ed\u5149\u30d3\u30eb6F', 'col_139': '03-6206-9011', 'col_140': null, 'col_141': null, 'col_142': null, 'col_143': null, 'col_144': null, 'col_145': null, 'col_146': null, 'col_147': null }];
var property_floor = [{ 'no4_id': '2', 'f_001': '1', 'f_002': '1', 'f_003': 'F1', 'f_004': '507.29', 'f_005': null, 'f_006': '507.29' },
{ 'no4_id': '2', 'f_001': '1', 'f_002': '2', 'f_003': 'F2', 'f_004': '469.60', 'f_005': null, 'f_006': '469.60' },
{ 'no4_id': '2', 'f_001': '1', 'f_002': '3', 'f_003': 'F3', 'f_004': '469.60', 'f_005': null, 'f_006': '469.60' },
{ 'no4_id': '2', 'f_001': '1', 'f_002': '4', 'f_003': 'F4', 'f_004': '443.14', 'f_005': null, 'f_006': '443.14' },
{ 'no4_id': '12', 'f_001': '1', 'f_002': '4', 'f_003': 'F4', 'f_004': '443.14', 'f_005': null, 'f_006': '443.14' }]

exports.requestPropertiesMysql = function (req, res) {
  var limit = Number(req.body.limit) || 10;
  var page = Number(req.body.page) || 1;
  var properties = mergeInfoProperty(property_info_1, property_info_2);

  res.json({
    list: properties,
    current: page,
    total: properties.length
  });
};

exports.importPropertyFormMysql = function (req, res) {
  var ids = req.body.ids;

  var property_info = mergeInfoProperty(property_info_1, property_info_2);
  var property_info3 = mergeInfoProperty(property_info, property_no3);
  var properties = mergeInfoProperty(property_info3, property_no4);
  var property;
  // ids.forEach(function (id) {
  var id = '2';
  property = _.find(properties, { property_id: id });
  if (!property) {
    return res.status(422).send({
      message: errorHandler.getErrorMessage('property is nulllll')
    });
  }
  var masterProperties;
  listMasterProperties()
  .then(function (_masterProperties) {
    masterProperties = _masterProperties;
    return importProperty(property, masterProperties);
  })
  .then(function (result) {
    res.json(result);
  })
  .catch(function (err) {
    return res.status(422).send({
      message: errorHandler.getErrorMessage(err)
    });
  });
  // });
};

function mergeInfoProperty(array1, array2) {
  return _.map(array1, function (p) {
    return _.merge(p, _.find(array2, { property_id: p.property_id }));
  });
}

function importProperty(_property, masterProperties) {
  return new Promise(function (resolve, reject) {
    var newDoc = new Property();
    // 物件概要
    newDoc.men10 = _property.col_005;
    newDoc.men11 = trim(_property.col_067);
    newDoc.men12 = trim(_property.col_070);
    newDoc.men13 = trim(_property.col_107);
    // 第三面
    newDoc.men3_1_1 = trim(_property.col_148);
    newDoc.men3_1_2 = trim(_property.col_149);
    newDoc.men3_2_1 = trim(_property.col_150);
    newDoc.men3_2_2 = trim(_property.col_151);
    newDoc.men3_3 = getValueMen3_3(_property);
    newDoc.men3_4 = split(_property.col_158);
    newDoc.men3_5_1 = getValueMen3_5_1(_property);
    newDoc.men3_5_2 = getValueMen3_5_2(_property);
    newDoc.men3_5_3 = trim(_property.col_165);
    newDoc.men3_6_1 = toFloat(_property.col_166);
    newDoc.men3_6_2 = toFloat(_property.col_167);
    // 7.敷地面積
    newDoc.men3_7_1.c1 = toFloat(_property.col_169);
    newDoc.men3_7_1.c2 = toFloat(_property.col_170);
    newDoc.men3_7_1.c3 = toFloat(_property.col_171);
    newDoc.men3_7_1.c4 = toFloat(_property.col_172);
    newDoc.men3_7_1.c5 = toFloat(_property.col_173);
    newDoc.men3_7_1.c6 = toFloat(_property.col_174);
    newDoc.men3_7_1.c7 = toFloat(_property.col_175);
    newDoc.men3_7_1.c8 = toFloat(_property.col_176);
    // ﾛ.用途地域等
    newDoc.men3_7_2.c1 = trim(_property.col_177);
    newDoc.men3_7_2.c2 = trim(_property.col_178);
    newDoc.men3_7_2.c3 = trim(_property.col_179);
    newDoc.men3_7_2.c4 = trim(_property.col_180);
    // ﾊ.建築基準法第52条第１項及び第２項の規定による建築物の容積率
    newDoc.men3_7_5.c1 = toFloat(_property.col_181);
    newDoc.men3_7_5.c2 = toFloat(_property.col_182);
    newDoc.men3_7_5.c3 = toFloat(_property.col_183);
    newDoc.men3_7_5.c4 = toFloat(_property.col_184);
    // ﾆ.建築基準法第53条第１項の規定による建築物の建蔽率
    newDoc.men3_7_6.c1 = toFloat(_property.col_181);
    newDoc.men3_7_6.c2 = toFloat(_property.col_182);
    newDoc.men3_7_6.c3 = toFloat(_property.col_183);
    newDoc.men3_7_6.c4 = toFloat(_property.col_184);
    // ﾎ.敷地面積の合計
    newDoc.men3_7_7 = {
      c1: newDoc.men3_7_1.c1 + newDoc.men3_7_1.c2 + newDoc.men3_7_1.c3 + newDoc.men3_7_1.c4,
      c2: newDoc.men3_7_1.c5 + newDoc.men3_7_1.c6 + newDoc.men3_7_1.c7 + newDoc.men3_7_1.c8
    };
    // ﾍ.敷地に建築可能な延べ面積を敷地面積で除した数値
    newDoc.men3_7_3 = toFloat(_property.col_191);
    // ﾊ.建築基準法第52条第１項及び第２項の規定による建築物の容積率
    newDoc.men3_7_4 = toFloat(_property.col_193);
    // 8.主要用途
    newDoc.men3_8.c1 = {
      class: getClassFromDivision(_property.col_198),
      division: trim(_property.col_198),
      text: trim(_property.col_199)
    };
    newDoc.men3_9 = split(_property.col_201);
    // 10.建築面積
    newDoc.men3_10_1 = toFloat(_property.col_209);
    newDoc.men3_10_2 = toFloat(_property.col_210);
    newDoc.men3_10_3 = toFloat(_property.col_211);
    newDoc.men3_10_4 = toFloat(_property.col_212);
    // 11.延べ面積
    newDoc.men3_11_1 = toFloat(_property.col_214);
    newDoc.men3_11_4 = toFloat(_property.col_215);
    newDoc.men3_11_5 = toFloat(_property.col_216);
    // ｦ.延べ面積
    newDoc.men3_11_2 = toFloat(_property.col_251);
    // ﾜ.容積率
    newDoc.men3_11_3 = toFloat(_property.col_216); // TODO
    // ﾛ.地階の住宅又は老人ホーム、福祉ホームその他これらに類するものの部分
    newDoc.men3_11_6 = {
      c1: toFloat(_property.col_217),
      c2: toFloat(_property.col_218),
      c3: toFloat(_property.col_219)
    };
    newDoc.men3_11_7 = {
      c1: toFloat(_property.col_220),
      c2: toFloat(_property.col_221),
      c3: toFloat(_property.col_222)
    };
    newDoc.men3_11_8 = {
      c1: toFloat(_property.col_223),
      c2: toFloat(_property.col_224),
      c3: toFloat(_property.col_225)
    };
    newDoc.men3_11_9 = {
      c1: toFloat(_property.col_226),
      c2: toFloat(_property.col_227),
      c3: toFloat(_property.col_228)
    };
    newDoc.men3_11_10 = {
      c1: toFloat(_property.col_229),
      c2: toFloat(_property.col_230),
      c3: toFloat(_property.col_231)
    };
    newDoc.men3_11_11 = {
      c1: toFloat(_property.col_232),
      c2: toFloat(_property.col_233),
      c3: toFloat(_property.col_234)
    };
    newDoc.men3_11_12 = {
      c1: toFloat(_property.col_235),
      c2: toFloat(_property.col_236),
      c3: toFloat(_property.col_237)
    };
    newDoc.men3_11_13 = {
      c1: toFloat(_property.col_238),
      c2: toFloat(_property.col_239),
      c3: toFloat(_property.col_240)
    };
    newDoc.men3_11_14 = {
      c1: toFloat(_property.col_241),
      c2: toFloat(_property.col_242),
      c3: toFloat(_property.col_243)
    };
    newDoc.men3_11_15 = {
      c1: toFloat(_property.col_244),
      c2: toFloat(_property.col_245),
      c3: toFloat(_property.col_246)
    };
    // 12.建築物の数
    newDoc.men3_12_1 = toFloat(_property.col_255);
    newDoc.men3_12_2 = toFloat(_property.col_256);
    // 13.建築物の高さ等
    newDoc.men3_13_1 = toFloat(_property.col_257);
    newDoc.men3_13_2 = toFloat(_property.col_258);
    newDoc.men3_13_3 = {
      c1: toFloat(_property.col_259),
      c2: toFloat(_property.col_261)
    };
    newDoc.men3_13_4 = {
      c1: toFloat(_property.col_260),
      c2: toFloat(_property.col_262)
    };
    newDoc.men3_13_5_1 = trim(_property.col_263);
    newDoc.men3_13_5_2 = trim(_property.col_264);
    newDoc.men3_13_6 = trim(_property.col_265);
    newDoc.men3_13_7 = getValueMen3_13_7(_property);
    // 14.許可・認定等
    newDoc.men3_14 = trim(_property.col_269);

    // 第四面
    newDoc.men4_1 = toFloat(_property.col_292);
    newDoc.men4_2.c1 = {
      class: getClassFromDivision(_property.col_294),
      division: trim(_property.col_294),
      text: trim(_property.col_295)
    };
    newDoc.men4_2.c2 = {
      class: getClassFromDivision(_property.col_296),
      division: trim(_property.col_296),
      text: trim(_property.col_297)
    };
    newDoc.men4_2.c3 = {
      class: getClassFromDivision(_property.col_298),
      division: trim(_property.col_298),
      text: trim(_property.col_299)
    };
    newDoc.men4_3 = getValueMen4_3(_property);
    newDoc.men4_4 = {
      c1: trim(_property.col_322),
      c2: trim(_property.col_323)
    };
    // 5.耐火建築物等
    newDoc.men4_5 = getValueMen4_5(_property);
    // 6.階数
    newDoc.men4_6_1 = toFloat(_property.col_333);
    newDoc.men4_6_2 = toFloat(_property.col_334);
    newDoc.men4_6_3 = toFloat(_property.col_335);
    newDoc.men4_6_4 = toFloat(_property.col_336);
    // 7.高さ
    newDoc.men4_7_1 = toFloat(_property.col_337);
    newDoc.men4_7_2 = toFloat(_property.col_338);
    // 8.建築設備の種類
    newDoc.men4_8 = trim(_property.col_339);
    newDoc.men4_9_1 = trim(_property.col_340);
    newDoc.men4_9_2 = trim(_property.col_341);
    // newDoc.men4_9_3 = trim(_property.col_341); // TODO
    newDoc.men4_9_4 = toFloat(_property.col_346);
    newDoc.men4_9_5 = getValueMen4_9_5(_property);
    newDoc.men4_9_6 = toFloat(_property.col_349);
    // 10.床 面 積
    // newDoc.men4_10_1 = toFloat(_property.col_349); // TODO
    // newDoc.men4_10_2 = toFloat(_property.col_349); // TODO
    // newDoc.men4_10_3 = toFloat(_property.col_349); // TODO
    // newDoc.men4_10_4 = toFloat(_property.col_349); // TODO
    var listData = getDataFloor4_10(_property.property_id);
    if(listData.length > 0) {
      newDoc.men4_10_14 = getValueMen4_10_14(listData[0].f_001);
      // list 5~13 (men4_10_5 ~ men4_10_13)
      var index = 5;
      listData.forEach(function (f) {
        newDoc['men4_10_' + index] = {
          c1: f.f_002,
          c2: f.f_004,
          c3: f.f_005,
          c4: f.f_006
        };
        index++;
      });
    }
    newDoc.men4_11 = trim(_property.col_353);
    newDoc.men4_12 = trim(_property.col_354);
    newDoc.men4_13 = trim(_property.col_355);
    newDoc.men4_14 = trim(_property.col_356);
    newDoc.men4_15 = getValueMen4_15(_property);
    newDoc.men4_16 = trim(_property.col_364);
    newDoc.men4_17 = trim(_property.col_365);
    // newDoc.save(function (err) {
    //   if (err) {
    //     reject(err);
    //   }
    resolve(newDoc);
    // });
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
  if (_property.col_157 === '1') { out.push('都市計画区域及び準都市計画区域外') }
  return out;
}

function getValueMen3_5_1(_property) {
  var out = [];
  if (_property.col_162 === '1') { out.push('内'); }
  if (_property.col_163 === '1') { out.push('外') }
  return out;
}

function getValueMen3_5_2(_property) {
  var out = [];
  if (_property.col_164 === '1') { out.push('内'); }
  return out;
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


function getDataFloor4_10(property_id) {
  return _.filter(property_floor, {no4_id: property_id});
}

function getValueMen4_10_14(f_001) {
  var out = '';
  if (f_001 === '1') { out = ('F'); }
  if (f_001 === '2') { out = ('B'); }
  if (f_001 === '3') { out = ('P'); }
  if (f_001 === '4') { out = ('M'); }
  return out;
}