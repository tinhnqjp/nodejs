'use strict';

/**
 * Module dependencies
 */
var lawsPolicy = require('../policies/laws.server.policy'),
  laws = require('../controllers/laws.server.controller');

module.exports = function (app) {
  app.route('/api/createLawsData')
    .get(laws.createData);

  // Laws collection routes
  app.route('/api/laws').all(lawsPolicy.isAllowed)
    .get(laws.list)
    .post(laws.create);

  // Single law routes
  app.route('/api/laws/:lawId').all(lawsPolicy.isAllowed)
    .get(laws.read)
    .put(laws.update)
    .delete(laws.delete);

  // Finish by binding the law middleware
  app.param('lawId', laws.lawByID);
};
