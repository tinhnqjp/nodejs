'use strict';

/**
 * Module dependencies
 */
var lawsPolicy = require('../policies/laws.server.policy'),
  laws = require('../controllers/laws.server.controller');

module.exports = function (app) {
  app.route('/api/createLawsData').post(laws.createData);

  // Laws collection routes
  app.route('/api/laws').all(lawsPolicy.isAllowed)
    .get(laws.list)
    .post(laws.create);

  // Single law routes
  app.route('/api/laws/:lawId').all(lawsPolicy.isAllowed)
    .get(laws.read)
    .put(laws.update)
    .delete(laws.delete);

  app.route('/api/laws/:lawId/requestDetail').post(laws.lawDetailById);
  app.route('/api/laws/:lawId/requestRegulation').post(laws.lawRegulationById);
  app.route('/api/laws/:lawId/requestData').post(laws.lawDataById);
  app.route('/api/laws/:lawId/postLawData').post(laws.postLawData);
  app.route('/api/laws/:lawId/copyLaw').post(laws.copy);

  // Finish by binding the law middleware
  app.param('lawId', laws.lawByID);

  app.route('/api/listMasterProperties').get(laws.listMasterProperties);
};
