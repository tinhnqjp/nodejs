'use strict';

/**
 * Module dependencies
 */
var lawsPolicy = require('../policies/laws.server.policy'),
  lawsMaster = require('../controllers/laws-master.server.controller'),
  laws = require('../controllers/laws.server.controller');

module.exports = function (app) {

  // Laws collection routes
  app.route('/api/laws').all(lawsPolicy.isAllowed)
    .get(laws.list)
    .post(laws.create);

  // Single law routes
  app.route('/api/laws/:lawId').all(lawsPolicy.isAllowed)
    .get(laws.read)
    .put(laws.update)
    .delete(laws.delete);

  app.route('/api/laws/:lawId/requestDetail')
    .all(lawsPolicy.isAllowed)
    .post(laws.lawDetailById);
  app.route('/api/laws/:lawId/requestRegulation')
    .all(lawsPolicy.isAllowed)
    .post(laws.lawRegulationById);
  app.route('/api/laws/:lawId/requestData')
    .all(lawsPolicy.isAllowed)
    .post(laws.lawDataById);
  app.route('/api/laws/:lawId/requestDataByLawId')
    .all(lawsPolicy.isAllowed)
    .post(laws.lawDataByLawId);
  app.route('/api/laws/:lawId/postLawData')
    .all(lawsPolicy.isAllowed)
    .post(laws.postLawData);
  app.route('/api/laws/:lawId/copyLaw')
    .all(lawsPolicy.isAllowed)
    .post(laws.copy);

  // Finish by binding the law middleware
  app.param('lawId', laws.lawByID);

  app.route('/api/listMasterProperties').get(lawsMaster.listMasterProperties);
  app.route('/api/listMasterLawDetail').get(lawsMaster.listMasterLawDetail);
  app.route('/api/listMasterLawTdfk').get(lawsMaster.listMasterLawTdfk);
  app.route('/api/listLawsByYear').post(lawsMaster.listLawsByYear);
};
